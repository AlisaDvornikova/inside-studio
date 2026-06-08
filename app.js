const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const multer = require('multer');
const db = require('./db/database');
const { getHomeData, DEFAULT_CONTENT } = require('./db/cms');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
require('dotenv').config();

const app = express();

// Доплата за нанесение собственного имени на товар мерча
const CUSTOM_NAME_FEE = 500;

// ===== Загрузка файлов (multer) =====
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'images')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'home-' + Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
    }
});
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'videos')),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'banner-' + Date.now() + ext);
    }
});
const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype))
});
const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, /^video\//.test(file.mimetype))
});

// Приводим телефон к единому виду: только цифры, без кода страны (последние 10 цифр).
// Благодаря этому +7XXXXXXXXXX и 8XXXXXXXXXX считаются одним и тем же номером.
function normalizePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.slice(-10);
}

// Настройки
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Мидлвары
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Передаём пользователя во все шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ========== ГЛАВНАЯ ==========
app.get('/', async (req, res) => {
    try {
        const [reviews] = await db.query(
            'SELECT r.*, u.name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.is_approved = true ORDER BY r.created_at DESC LIMIT 3'
        );
        const { blocks, content, images } = await getHomeData();
        res.render('index', { reviews: reviews || [], blocks, content, images });
    } catch (err) {
        console.error('Ошибка загрузки главной:', err);
        res.render('index', { reviews: [], blocks: [], content: {}, images: [] });
    }
});

// ========== ТРЕНЕРЫ ==========
app.get('/trainers', async (req, res) => {
    try {
        const [trainers] = await db.query('SELECT * FROM trainers');
        res.render('trainers', { trainers: trainers || [] });
    } catch (err) {
        res.render('trainers', { trainers: [] });
    }
});

app.get('/trainer/:id', async (req, res) => {
    try {
        const [trainers] = await db.query('SELECT * FROM trainers WHERE id = ?', [req.params.id]);
        if (trainers.length === 0) return res.redirect('/trainers');
        res.render('trainer-card', { trainer: trainers[0] });
    } catch (err) {
        res.redirect('/trainers');
    }
});
// ========== РАСПИСАНИЕ ==========
app.get('/schedule', async (req, res) => {
    try {
        const query = `
            SELECT s.*, t.name as trainer_name, d.name as direction_name
            FROM schedule s
            LEFT JOIN trainers t ON s.trainer_id = t.id
            LEFT JOIN directions d ON s.direction_id = d.id
            ORDER BY FIELD(day_of_week, 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'), s.hall, s.time
        `;
        const [schedule] = await db.query(query);

        // Группируем по дню недели, затем по залу
        const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
        const grouped = {};
        days.forEach(d => { grouped[d] = {}; });
        schedule.forEach(item => {
            if (!grouped[item.day_of_week]) return;
            const hall = item.hall || '1 зал';
            if (!grouped[item.day_of_week][hall]) grouped[item.day_of_week][hall] = [];
            grouped[item.day_of_week][hall].push(item);
        });

        // Преобразуем в упорядоченные массивы залов
        const scheduleData = {};
        days.forEach(d => {
            scheduleData[d] = Object.keys(grouped[d]).sort().map(h => ({ hall: h, items: grouped[d][h] }));
        });

        res.render('schedule', { schedule: scheduleData });
    } catch (err) {
        console.error('Ошибка загрузки расписания:', err);
        res.render('schedule', { schedule: { 'ПН': [], 'ВТ': [], 'СР': [], 'ЧТ': [], 'ПТ': [], 'СБ': [], 'ВС': [] } });
    }
});

// ========== ЦЕНЫ ==========
app.get('/prices', async (req, res) => {
    try {
        const [subscriptions] = await db.query('SELECT * FROM subscriptions WHERE is_active = true');
        res.render('prices', { subscriptions: subscriptions || [] });
    } catch (err) {
        res.render('prices', { subscriptions: [] });
    }
});

// ========== МЕРЧ ==========
app.get('/merch', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM merch_products WHERE is_active = 1 ORDER BY id DESC');
        // Превращаем строки "цвет1,цвет2" в массивы для удобного вывода
        const list = (products || []).map(p => ({
            ...p,
            colorList: (p.colors || '').split(',').map(s => s.trim()).filter(Boolean),
            sizeList: (p.sizes || '').split(',').map(s => s.trim()).filter(Boolean)
        }));
        res.render('merch', { products: list, customNameFee: CUSTOM_NAME_FEE });
    } catch (err) {
        console.error('Ошибка загрузки мерча:', err);
        res.render('merch', { products: [], customNameFee: CUSTOM_NAME_FEE });
    }
});

// Шаг 1: переход к оплате заказа мерча — показываем страницу оплаты
app.post('/merch/checkout', isAuthenticated, async (req, res) => {
    try {
        const { product_id, color, size, custom_name } = req.body;
        const [products] = await db.query('SELECT * FROM merch_products WHERE id = ? AND is_active = 1', [product_id]);
        if (products.length === 0) return res.redirect('/merch?error=notfound');

        const product = products[0];
        const wantsName = custom_name && custom_name.trim().length > 0;
        const customNameValue = wantsName ? custom_name.trim().slice(0, 120) : '';
        const total = Number(product.price) + (wantsName ? CUSTOM_NAME_FEE : 0);

        res.render('merch-payment', {
            order: {
                product_id: product.id,
                product_name: product.name,
                color: color || '',
                size: size || '',
                custom_name: customNameValue,
                total
            },
            customNameFee: CUSTOM_NAME_FEE
        });
    } catch (err) {
        console.error('Ошибка оформления заказа мерча:', err);
        res.redirect('/merch?error=order');
    }
});

// Шаг 2: подтверждение оплаты — создаём заказ
app.post('/merch/payment/confirm', isAuthenticated, async (req, res) => {
    try {
        const { product_id, color, size, custom_name, payment_method } = req.body;
        const [products] = await db.query('SELECT * FROM merch_products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.json({ success: false, error: 'Товар не найден' });
        }

        const product = products[0];
        const wantsName = custom_name && String(custom_name).trim().length > 0;
        const customNameValue = wantsName ? String(custom_name).trim().slice(0, 120) : null;
        const total = Number(product.price) + (wantsName ? CUSTOM_NAME_FEE : 0);

        await db.query(
            `INSERT INTO merch_orders (user_id, product_id, product_name, color, size, custom_name, total_price, status, payment_method)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'in_work', ?)`,
            [
                req.session.user.id,
                product.id,
                product.name,
                color || null,
                size || null,
                customNameValue,
                total,
                payment_method || 'card'
            ]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Ошибка подтверждения оплаты мерча:', err);
        res.json({ success: false, error: err.message });
    }
});

// ========== ДОБАВЛЕНИЕ ОТЗЫВА ==========
app.post('/reviews/add', isAuthenticated, async (req, res) => {
    const { text, rating } = req.body;
    try {
        await db.query(
            'INSERT INTO reviews (user_id, text, rating, is_approved) VALUES (?, ?, ?, false)',
            [req.session.user.id, text, rating]
        );
        res.redirect('/profile?review_success=1');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?review_error=1');
    }
});

// ========== УПРАВЛЕНИЕ ОТЗЫВАМИ ДЛЯ АДМИНА ==========
app.get('/admin/approve-review/:id', isAdmin, async (req, res) => {
    console.log('=== ОДОБРЕНИЕ ОТЗЫВА ===');
    console.log('ID отзыва:', req.params.id);
    console.log('Роль пользователя:', req.session.user?.role);
    try {
        const [result] = await db.query('UPDATE reviews SET is_approved = true WHERE id = ?', [req.params.id]);
        console.log('Результат:', result);
        res.redirect('/profile?tab=manage-reviews');
    } catch (err) {
        console.error('Ошибка:', err);
        res.redirect('/profile?tab=manage-reviews');
    }
});

app.get('/admin/delete-review/:id', isAdmin, async (req, res) => {
    console.log('=== УДАЛЕНИЕ ОТЗЫВА ===');
    console.log('ID отзыва:', req.params.id);
    try {
        await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        console.log('Отзыв удалён');
        res.redirect('/profile?tab=manage-reviews');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?tab=manage-reviews');
    }
});

// ========== РЕДАКТИРОВАНИЕ ОТЗЫВОВ ДЛЯ АДМИНА ==========
app.get('/admin/edit-review/:id', isAdmin, async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [req.params.id]);
        
        if (reviews.length === 0) return res.redirect('/profile?tab=manage-reviews');
        res.render('admin/edit-review', { review: reviews[0], error: req.query.error || false });
    } catch (err) {
        console.error(err);
        res.redirect('/profile?tab=manage-reviews');
    }
});

app.post('/admin/edit-review/:id', isAdmin, async (req, res) => {
    const { text, rating } = req.body;
    try {
        await db.query(
            'UPDATE reviews SET text = ?, rating = ? WHERE id = ?',
            [text, rating, req.params.id]
        );
        res.redirect('/profile?tab=manage-reviews&edit_success=1');
    } catch (err) {
        console.error(err);
        res.redirect(`/admin/edit-review/${req.params.id}?error=1`);
    }
});

// ========== ЛИЧНЫЙ КАБИНЕТ ==========
app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, s.day_of_week, s.time, d.name as direction_name, t.name as trainer_name
            FROM bookings b
            JOIN schedule s ON b.schedule_id = s.id
            JOIN directions d ON s.direction_id = d.id
            JOIN trainers t ON s.trainer_id = t.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `, [req.session.user.id]);
        
        const [userReviews] = await db.query(`
            SELECT * FROM reviews 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [req.session.user.id]);
        
        const [subscriptions] = await db.query(`
            SELECT * FROM user_subscriptions 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [req.session.user.id]);
        
        const [merchOrders] = await db.query(`
            SELECT * FROM merch_orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [req.session.user.id]);

        let allReviews = [];
        let allSubscriptions = [];
        let allMerchOrders = [];

        if (req.session.user.role === 'admin') {
            const [reviews] = await db.query(`
                SELECT r.*, u.name as user_name 
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC
            `);
            allReviews = reviews;
            console.log('Найдено отзывов для админа:', allReviews.length);
            
            const [subs] = await db.query(`
                SELECT us.*, u.name as user_name 
                FROM user_subscriptions us
                JOIN users u ON us.user_id = u.id
                ORDER BY us.created_at DESC
            `);
            allSubscriptions = subs;

            const [merchAll] = await db.query(`
                SELECT mo.*, u.name as user_name, u.phone as user_phone
                FROM merch_orders mo
                JOIN users u ON mo.user_id = u.id
                ORDER BY mo.created_at DESC
            `);
            allMerchOrders = merchAll;
        }

        res.render('profile', {
            bookings: bookings || [],
            userReviews: userReviews || [],
            user: req.session.user,
            subscriptions: subscriptions || [],
            merchOrders: merchOrders || [],
            allMerchOrders: allMerchOrders,
            allReviews: allReviews,
            allSubscriptions: allSubscriptions,
            merch_success: req.query.merch_success || false,
            attend_success: req.query.attend_success || false,
            attend_error: req.query.attend_error || false,
            success: req.query.success || false,
            review_success: req.query.review_success || false,
            review_error: req.query.review_error || false,
            update_success: req.query.update_success || false,
            update_error: req.query.update_error || false,
            password_success: req.query.password_success || false,
            password_error: req.query.password_error || false,
            edit_success: req.query.edit_success || false
        });
    } catch (err) {
        console.error(err);
        res.render('profile', {
            bookings: [],
            userReviews: [],
            user: req.session.user,
            subscriptions: [],
            merchOrders: [],
            allMerchOrders: [],
            allReviews: [],
            allSubscriptions: [],
            merch_success: false,
            attend_success: false,
            attend_error: false,
            success: false,
            review_success: false,
            review_error: false,
            update_success: false,
            update_error: false,
            password_success: false,
            password_error: false,
            edit_success: false
        });
    }
});

// ========== ИЗМЕНЕНИЕ ДАННЫХ ПРОФИЛЯ ==========
app.post('/profile/update', isAuthenticated, async (req, res) => {
    const { last_name, first_name, middle_name, phone } = req.body;
    const fullName = [last_name, first_name, middle_name]
        .map(s => (s || '').trim())
        .filter(Boolean)
        .join(' ');
    try {
        await db.query(
            'UPDATE users SET name = ?, last_name = ?, first_name = ?, middle_name = ?, phone = ? WHERE id = ?',
            [fullName, (last_name || '').trim(), (first_name || '').trim(), (middle_name || '').trim(), phone, req.session.user.id]
        );
        req.session.user.name = fullName;
        req.session.user.last_name = (last_name || '').trim();
        req.session.user.first_name = (first_name || '').trim();
        req.session.user.middle_name = (middle_name || '').trim();
        req.session.user.phone = phone;
        res.redirect('/profile?update_success=1');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?update_error=1');
    }
});

// ========== ИЗМЕНЕНИЕ ПАРОЛЯ ==========
app.post('/profile/change-password', isAuthenticated, async (req, res) => {
    const { current_password, new_password, confirm_password } = req.body;
    
    if (new_password !== confirm_password) {
        return res.redirect('/profile?password_error=1');
    }
    
    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.session.user.id]);
        const match = await bcrypt.compare(current_password, users[0].password);
        
        if (!match) {
            return res.redirect('/profile?password_error=2');
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.session.user.id]);
        res.redirect('/profile?password_success=1');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?password_error=1');
    }
});

// ========== ПРОВЕРКА АВТОРИЗАЦИИ ==========
app.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.user });
});

// ========== ПОКУПКА АБОНЕМЕНТА ==========
app.get('/buy/:id', isAuthenticated, async (req, res) => {
    try {
        const [subscriptions] = await db.query('SELECT * FROM subscriptions WHERE id = ? AND is_active = true', [req.params.id]);
        if (subscriptions.length === 0) return res.redirect('/prices');
        res.render('payment', { subscription: subscriptions[0] });
    } catch (err) {
        console.error(err);
        res.redirect('/prices');
    }
});

app.post('/payment/confirm/:id', isAuthenticated, async (req, res) => {
    try {
        const [subscriptions] = await db.query('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
        if (subscriptions.length === 0) {
            return res.json({ success: false, error: 'Абонемент не найден' });
        }
        
        const subscription = subscriptions[0];
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + subscription.duration_days);
        
        const paymentMethod = req.body.payment_method || 'card';
        
        await db.query(`
            INSERT INTO user_subscriptions (user_id, name, total_classes, remaining_classes, valid_until, is_active, payment_method)
            VALUES (?, ?, ?, ?, ?, true, ?)
        `, [
            req.session.user.id,
            subscription.name,
            subscription.total_classes || 0,
            subscription.total_classes || 0,
            validUntil,
            paymentMethod
        ]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: err.message });
    }
});

// ========== АВТОРИЗАЦИЯ ==========
app.get('/login', (req, res) => {
    const error = req.query.error === '1';
    res.render('login', { error });
});

app.post('/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        // Сравниваем по последним 10 цифрам, игнорируя +7/8 и разделители (пробелы, скобки, дефисы)
        const phoneKey = normalizePhone(phone);
        const [users] = await db.query(
            "SELECT * FROM users WHERE RIGHT(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', ''), 10) = ?",
            [phoneKey]
        );
        if (users.length === 0) {
            return res.redirect('/login?error=1');
        }
        
        const user = users[0];
        
        // Для администратора пропускаем проверку пароля
        if (user.role === 'admin') {
            req.session.user = {
                id: user.id,
                phone: user.phone,
                name: user.name,
                last_name: user.last_name,
                first_name: user.first_name,
                middle_name: user.middle_name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            };
            return res.redirect('/admin');
        }
        
        // Для обычных пользователей проверяем пароль
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.redirect('/login?error=1');
        }
        
        req.session.user = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            last_name: user.last_name,
            first_name: user.first_name,
            middle_name: user.middle_name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };
        res.redirect('/');
    } catch (err) {
        res.redirect('/login?error=1');
    }
});

app.get('/register', (req, res) => {
    const error = req.query.error === '1';
    res.render('register', { error });
});

app.post('/register', async (req, res) => {
    const { phone, password, email, last_name, first_name, middle_name } = req.body;

    if (password !== req.body.confirm_password) {
        return res.redirect('/register?error=1');
    }

    // Собираем ФИО в единое поле name для отображения
    const fullName = [last_name, first_name, middle_name]
        .map(s => (s || '').trim())
        .filter(Boolean)
        .join(' ');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (phone, password, name, last_name, first_name, middle_name, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                phone,
                hashedPassword,
                fullName,
                (last_name || '').trim(),
                (first_name || '').trim(),
                (middle_name || '').trim(),
                email || ''
            ]
        );
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register?error=1');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ========== ЗАПИСЬ НА ЗАНЯТИЕ ==========
app.get('/booking/:id', isAuthenticated, async (req, res) => {
    try {
        const [schedule] = await db.query(`
            SELECT s.*, t.name as trainer_name, d.name as direction_name
            FROM schedule s
            JOIN trainers t ON s.trainer_id = t.id
            JOIN directions d ON s.direction_id = d.id
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (schedule.length === 0) return res.redirect('/schedule');
        res.render('booking', { lesson: schedule[0], error: req.query.error || false });
    } catch (err) {
        res.redirect('/schedule');
    }
});

app.post('/booking/:id', isAuthenticated, async (req, res) => {
    try {
        await db.query(
            'INSERT INTO bookings (user_id, schedule_id, booking_date) VALUES (?, ?, CURDATE())',
            [req.session.user.id, req.params.id]
        );
        res.redirect('/profile?success=1');
    } catch (err) {
        res.redirect(`/booking/${req.params.id}?error=1`);
    }
});

// ========== АДМИН-ПАНЕЛЬ ==========
app.get('/admin', isAdmin, (req, res) => {
    res.render('admin/dashboard');
});

app.get('/admin/schedule', isAdmin, async (req, res) => {
    try {
        const [schedule] = await db.query(`
            SELECT s.*, t.name as trainer_name, d.name as direction_name
            FROM schedule s
            LEFT JOIN trainers t ON s.trainer_id = t.id
            LEFT JOIN directions d ON s.direction_id = d.id
            ORDER BY FIELD(s.day_of_week, 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'), s.hall, s.time
        `);
        const [trainers] = await db.query('SELECT * FROM trainers');
        const [directions] = await db.query('SELECT * FROM directions');

        let editItem = null;
        if (req.query.edit) {
            const [rows] = await db.query('SELECT * FROM schedule WHERE id = ?', [req.query.edit]);
            editItem = rows[0] || null;
        }

        res.render('admin/schedule', {
            schedule: schedule || [],
            trainers: trainers || [],
            directions: directions || [],
            editItem
        });
    } catch (err) {
        console.error('Ошибка загрузки админ-расписания:', err);
        res.render('admin/schedule', { schedule: [], trainers: [], directions: [], editItem: null });
    }
});

app.post('/admin/schedule/add', isAdmin, async (req, res) => {
    const { trainer_id, direction_id, day_of_week, time, max_seats, hall, age_group } = req.body;
    await db.query(
        'INSERT INTO schedule (trainer_id, direction_id, day_of_week, time, max_seats, hall, age_group) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [trainer_id, direction_id, day_of_week, time, max_seats || 15, hall || '1 зал', age_group || '']
    );
    res.redirect('/admin/schedule');
});

app.post('/admin/schedule/edit/:id', isAdmin, async (req, res) => {
    const { trainer_id, direction_id, day_of_week, time, max_seats, hall, age_group } = req.body;
    await db.query(
        'UPDATE schedule SET trainer_id = ?, direction_id = ?, day_of_week = ?, time = ?, max_seats = ?, hall = ?, age_group = ? WHERE id = ?',
        [trainer_id, direction_id, day_of_week, time, max_seats || 15, hall || '1 зал', age_group || '', req.params.id]
    );
    res.redirect('/admin/schedule');
});

app.post('/admin/schedule/delete/:id', isAdmin, async (req, res) => {
    await db.query('DELETE FROM schedule WHERE id = ?', [req.params.id]);
    res.redirect('/admin/schedule');
});

app.get('/admin/trainers', isAdmin, async (req, res) => {
    const [trainers] = await db.query('SELECT * FROM trainers');
    let editItem = null;
    if (req.query.edit) {
        const [rows] = await db.query('SELECT * FROM trainers WHERE id = ?', [req.query.edit]);
        editItem = rows[0] || null;
    }
    res.render('admin/trainers', { trainers: trainers || [], editItem });
});

app.post('/admin/trainers/add', isAdmin, uploadImage.single('photo'), async (req, res) => {
    try {
        const { name, specialties, description, social, experience, age_groups, quote } = req.body;
        const photo = req.file ? '/images/' + req.file.filename : null;
        await db.query(
            'INSERT INTO trainers (name, specialties, experience, age_groups, quote, description, social, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, specialties || '', experience || '', age_groups || '', quote || '', description || '', social || '', photo]
        );
    } catch (err) {
        console.error('Ошибка добавления тренера:', err);
    }
    res.redirect('/admin/trainers');
});

app.post('/admin/trainers/edit/:id', isAdmin, uploadImage.single('photo'), async (req, res) => {
    try {
        const { name, specialties, description, social, experience, age_groups, quote } = req.body;
        if (req.file) {
            const photo = '/images/' + req.file.filename;
            await db.query(
                'UPDATE trainers SET name = ?, specialties = ?, experience = ?, age_groups = ?, quote = ?, description = ?, social = ?, photo = ? WHERE id = ?',
                [name, specialties || '', experience || '', age_groups || '', quote || '', description || '', social || '', photo, req.params.id]
            );
        } else {
            // Фото не меняем, если новый файл не загружен
            await db.query(
                'UPDATE trainers SET name = ?, specialties = ?, experience = ?, age_groups = ?, quote = ?, description = ?, social = ? WHERE id = ?',
                [name, specialties || '', experience || '', age_groups || '', quote || '', description || '', social || '', req.params.id]
            );
        }
    } catch (err) {
        console.error('Ошибка редактирования тренера:', err);
    }
    res.redirect('/admin/trainers');
});

app.post('/admin/trainers/delete/:id', isAdmin, async (req, res) => {
    try {
        const trainerId = req.params.id;
        const [rows] = await db.query('SELECT * FROM trainers WHERE id = ?', [trainerId]);

        // Сначала убираем зависимые записи, иначе сработает внешний ключ:
        // bookings -> schedule -> trainers
        const [lessons] = await db.query('SELECT id FROM schedule WHERE trainer_id = ?', [trainerId]);
        if (lessons.length > 0) {
            const lessonIds = lessons.map(l => l.id);
            await db.query('DELETE FROM bookings WHERE schedule_id IN (?)', [lessonIds]);
            await db.query('DELETE FROM schedule WHERE trainer_id = ?', [trainerId]);
        }

        await db.query('DELETE FROM trainers WHERE id = ?', [trainerId]);

        // Удаляем только загруженные через админку файлы (home-*)
        if (rows.length > 0 && rows[0].photo && /\/images\/home-/.test(rows[0].photo)) {
            fs.unlink(path.join(__dirname, 'public', rows[0].photo.replace(/^\//, '')), () => {});
        }
    } catch (err) {
        console.error('Ошибка удаления тренера:', err);
    }
    res.redirect('/admin/trainers');
});

// ========== ОТМЕТКА ПОСЕЩЕНИЯ (АДМИН) ==========
app.post('/admin/subscription/:id/attend', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user_subscriptions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.redirect('/profile?tab=all-subscriptions');
        const sub = rows[0];

        if (sub.total_classes > 0) {
            // Абонемент по количеству занятий — списываем одно занятие
            if (sub.remaining_classes <= 0) {
                // Занятий не осталось — деактивируем
                await db.query('UPDATE user_subscriptions SET is_active = 0 WHERE id = ?', [sub.id]);
                return res.redirect('/profile?tab=all-subscriptions&attend_error=1');
            }
            const newRemaining = sub.remaining_classes - 1;
            await db.query(
                'UPDATE user_subscriptions SET remaining_classes = ?, visits = visits + 1, is_active = ? WHERE id = ?',
                [newRemaining, newRemaining > 0 ? 1 : 0, sub.id]
            );
        } else {
            // Безлимитный/месячный абонемент — просто фиксируем посещение
            await db.query('UPDATE user_subscriptions SET visits = visits + 1 WHERE id = ?', [sub.id]);
        }
        res.redirect('/profile?tab=all-subscriptions&attend_success=1');
    } catch (err) {
        console.error('Ошибка отметки посещения:', err);
        res.redirect('/profile?tab=all-subscriptions&attend_error=1');
    }
});

// ========== УПРАВЛЕНИЕ ГЛАВНОЙ СТРАНИЦЕЙ ==========
app.get('/admin/home', isAdmin, async (req, res) => {
    try {
        const { blocks, content, images } = await getHomeData();
        res.render('admin/home', {
            blocks,
            content,
            images,
            saved: req.query.saved === '1',
            error: req.query.error || false
        });
    } catch (err) {
        console.error('Ошибка загрузки админки главной:', err);
        res.redirect('/admin');
    }
});

// Сохранение всех текстовых полей
app.post('/admin/home/content', isAdmin, async (req, res) => {
    try {
        const keys = Object.keys(DEFAULT_CONTENT);
        for (const key of keys) {
            if (typeof req.body[key] !== 'undefined') {
                await db.query(
                    'INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)',
                    [key, req.body[key]]
                );
            }
        }
        res.redirect('/admin/home?saved=1');
    } catch (err) {
        console.error('Ошибка сохранения контента:', err);
        res.redirect('/admin/home?error=save');
    }
});

// Показать/скрыть блок
app.post('/admin/home/block/:id/toggle', isAdmin, async (req, res) => {
    try {
        await db.query('UPDATE home_blocks SET is_visible = 1 - is_visible WHERE id = ?', [req.params.id]);
    } catch (err) {
        console.error('Ошибка переключения блока:', err);
    }
    res.redirect('/admin/home');
});

// Изменить порядок блока (up/down)
app.post('/admin/home/block/:id/move', isAdmin, async (req, res) => {
    try {
        const direction = req.body.direction;
        const [rows] = await db.query('SELECT * FROM home_blocks WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.redirect('/admin/home');
        const current = rows[0];

        const op = direction === 'up' ? '<' : '>';
        const order = direction === 'up' ? 'DESC' : 'ASC';
        const [neighbors] = await db.query(
            `SELECT * FROM home_blocks WHERE sort_order ${op} ? ORDER BY sort_order ${order} LIMIT 1`,
            [current.sort_order]
        );
        if (neighbors.length > 0) {
            const neighbor = neighbors[0];
            await db.query('UPDATE home_blocks SET sort_order = ? WHERE id = ?', [neighbor.sort_order, current.id]);
            await db.query('UPDATE home_blocks SET sort_order = ? WHERE id = ?', [current.sort_order, neighbor.id]);
        }
    } catch (err) {
        console.error('Ошибка изменения порядка:', err);
    }
    res.redirect('/admin/home');
});

// Загрузка фото в карусель студии
app.post('/admin/home/image', isAdmin, uploadImage.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.redirect('/admin/home?error=image');
        const imagePath = '/images/' + req.file.filename;
        const [rows] = await db.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM home_images');
        await db.query('INSERT INTO home_images (image_path, sort_order) VALUES (?, ?)', [imagePath, rows[0].next]);
        res.redirect('/admin/home?saved=1');
    } catch (err) {
        console.error('Ошибка загрузки фото:', err);
        res.redirect('/admin/home?error=image');
    }
});

// Удаление фото из карусели
app.post('/admin/home/image/delete/:id', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM home_images WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            await db.query('DELETE FROM home_images WHERE id = ?', [req.params.id]);
            // Удаляем только загруженные через CMS файлы (home-*), исходные carousel-*.jpg оставляем
            const filePath = path.join(__dirname, 'public', rows[0].image_path.replace(/^\//, ''));
            if (/\/images\/home-/.test(rows[0].image_path)) {
                fs.unlink(filePath, () => {});
            }
        }
    } catch (err) {
        console.error('Ошибка удаления фото:', err);
    }
    res.redirect('/admin/home');
});

// Загрузка видео баннера
app.post('/admin/home/video', isAdmin, uploadVideo.single('video'), async (req, res) => {
    try {
        if (!req.file) return res.redirect('/admin/home?error=video');
        const videoPath = '/videos/' + req.file.filename;
        await db.query(
            'INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_value = VALUES(content_value)',
            ['banner_video', videoPath]
        );
        res.redirect('/admin/home?saved=1');
    } catch (err) {
        console.error('Ошибка загрузки видео:', err);
        res.redirect('/admin/home?error=video');
    }
});

// ========== АДМИН: ТОВАРЫ МЕРЧА ==========
app.get('/admin/merch', isAdmin, async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM merch_products ORDER BY id DESC');
        res.render('admin/merch', {
            products: products || [],
            saved: req.query.saved === '1',
            error: req.query.error || false
        });
    } catch (err) {
        console.error('Ошибка загрузки товаров мерча:', err);
        res.redirect('/admin');
    }
});

app.post('/admin/merch/add', isAdmin, uploadImage.single('image'), async (req, res) => {
    try {
        const { name, description, price, colors, sizes } = req.body;
        const imagePath = req.file ? '/images/' + req.file.filename : '';
        await db.query(
            'INSERT INTO merch_products (name, description, price, image, colors, sizes, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [name, description || '', Number(price) || 0, imagePath, colors || '', sizes || '']
        );
        res.redirect('/admin/merch?saved=1');
    } catch (err) {
        console.error('Ошибка добавления товара:', err);
        res.redirect('/admin/merch?error=add');
    }
});

app.post('/admin/merch/toggle/:id', isAdmin, async (req, res) => {
    try {
        await db.query('UPDATE merch_products SET is_active = 1 - is_active WHERE id = ?', [req.params.id]);
    } catch (err) {
        console.error('Ошибка переключения товара:', err);
    }
    res.redirect('/admin/merch');
});

app.post('/admin/merch/delete/:id', isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM merch_products WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            await db.query('DELETE FROM merch_products WHERE id = ?', [req.params.id]);
            // Удаляем только загруженные через админку файлы (home-*)
            if (rows[0].image && /\/images\/home-/.test(rows[0].image)) {
                const filePath = path.join(__dirname, 'public', rows[0].image.replace(/^\//, ''));
                fs.unlink(filePath, () => {});
            }
        }
    } catch (err) {
        console.error('Ошибка удаления товара:', err);
    }
    res.redirect('/admin/merch');
});

// Изменение статуса заказа мерча (in_work / ready)
app.post('/admin/merch/order/:id/status', isAdmin, async (req, res) => {
    try {
        const status = req.body.status === 'ready' ? 'ready' : 'in_work';
        await db.query('UPDATE merch_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    } catch (err) {
        console.error('Ошибка изменения статуса заказа:', err);
    }
    res.redirect('/profile?tab=manage-merch');
});

// ========== ЗАПУСК СЕРВЕРА ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});