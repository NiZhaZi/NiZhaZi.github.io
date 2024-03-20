// script.js
const carBrands = [
    { name: 'FORAL风傲', models: ['MINERVA', 'ANNAN', 'INCITY', 'OVERCITY', 'FLYING'] },
    { name: 'IND艾恩德', models: ['A0', 'A1', 'A2 Classic', 'E2', 'Citra', 'X CROSS', 'E3', 'NEX5', 'A4', 'A6', 'MAX7', 'BC4', 'F5', 'MAX9'] },
    { name: 'MOTOP摩速', models: ['', '', ''] },
    { name: 'DELUXACE谛娜西斯', models: ['EM Classic', 'KM Classic'] },
    { name: 'THUNDERIGHT雳行', models: ['141'] }
    // 添加其他品牌和车型
];

const navLinks = document.querySelectorAll('nav a');
const mainContent = document.querySelector('main');

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const brandName = link.textContent;
        const brand = carBrands.find(b => b.name === brandName);
        if (brand) {
            displayModels(brand);
        }
    });
});

function displayModels(brand) {
    mainContent.innerHTML = '';
    const modelsList = document.createElement('ul');
    brand.models.forEach(model => {
        const li = document.createElement('li');
        li.textContent = model;
        li.addEventListener('click', () => {
            // 在这里跳转到 A3 配置详情页面
            if (model === 'A3') {
                window.location.href = 'a3_details.html';
            } else if (model === 'A4') {
                window.location.href = 'a4_details.html';
            }
        });
        modelsList.appendChild(li);
    });
    mainContent.appendChild(modelsList);
}
