// Помощник для работы с контентом главной страницы (мини-CMS).
// Таблицы home_blocks, site_content, home_images уже существуют в MySQL —
// этот модуль их только запрашивает, как и остальной код сайта.

const db = require('./database');

// Перечень текстовых полей главной страницы (ключ -> значение по умолчанию).
// Используется в админке для определения, какие поля сохранять.
const DEFAULT_CONTENT = {
    banner_video: '/videos/inside-banner.MP4',
    banner_btn_guest: 'Начать сейчас',
    banner_btn_user: 'Личный кабинет',

    about_title: 'Про нас',
    about_text1: 'Не просто место для танцев, это настоящая тусовка единомышленников, которые готовы развиваться и вдохновляться друг другом!',
    about_text2: 'Каждый из вас может стать частью этой невероятной команды и реализовать свои творческие амбиции!',

    reviews_title: 'Отзывы наших учеников',

    social_title: 'Подпишись на наши соц-сети!',
    social_note: '*Запрещено на территории Российской Федерации',
    social_instagram: 'https://www.instagram.com/inside.dance.ang?igsh=MWJpc2c3N2p3aGlwOQ==',
    social_telegram: 'https://t.me/INSIDE_danceang',
    social_vk: 'https://vk.com/insideangarsk',

    address_title: 'Найди нас на картах',
    address_name: 'INSIDE Dance Studio',
    address_line1: 'г. Ангарск, ул 14 Декабря, 22',
    address_line2: '(За ДК "Современник")',
    map_link: 'https://yandex.ru/maps/?text=%D0%90%D0%BD%D0%B3%D0%B0%D1%80%D1%81%D0%BA%20%D1%83%D0%BB%2014%20%D0%94%D0%B5%D0%BA%D0%B0%D0%B1%D1%80%D1%8F%2022',
    map_link_text: 'Открыть в Яндекс Картах →',
};

// Возвращает контент главной страницы в удобном виде
async function getHomeData() {
    const [blocks] = await db.query('SELECT * FROM home_blocks ORDER BY sort_order ASC, id ASC');
    const [contentRows] = await db.query('SELECT content_key, content_value FROM site_content');
    const [images] = await db.query('SELECT * FROM home_images ORDER BY sort_order ASC, id ASC');

    const content = {};
    contentRows.forEach(r => { content[r.content_key] = r.content_value; });

    return { blocks, content, images };
}

module.exports = { getHomeData, DEFAULT_CONTENT };
