// مصفوفة السلة
let cart = [];

// عناصر الصفحة
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItemsList = document.getElementById('cartItemsList');
const totalPriceElement = document.getElementById('totalPrice');
const paymentForm = document.getElementById('paymentForm');

const tailorModal = document.getElementById('tailorModal');
const openTailorBtn = document.querySelector('.btn-tailor');
const closeTailor = document.getElementById('closeTailor');
const tailorForm = document.getElementById('tailorForm');

const addToCartButtons = document.querySelectorAll('.add-to-cart');

// 1. تشغيل أزرار إضافة المنتجات العادية لسلة المشتريات
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productCard = e.target.parentElement;
        const productName = productCard.querySelector('h3').textContent;
        const productPriceText = productCard.querySelector('.price').textContent;
        const productPrice = parseInt(productPriceText.replace(/[^0-9]/g, ''));

        // إضافة المادة للسلة
        cart.push({ name: productName, price: productPrice });
        
        // تحديث الفاتورة والزر
        updateCartDisplay();

        // حركة تأكيد خفيفة للزر
        button.textContent = 'تمت الإضافة! ✓';
        button.style.backgroundColor = '#2ecc71';
        setTimeout(() => {
            button.textContent = 'أضف للسلة';
            button.style.backgroundColor = '#0b192c';
        }, 1500);
    });
});

// دالة تحديث شكل السلة وحساب الحساب
function updateCartDisplay() {
    cartBtn.textContent = `🛒 السلة (${cart.length})`;
    cartItemsList.innerHTML = '';
    let currentTotal = 0;

    cart.forEach(item => {
        currentTotal += item.price;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '10px';
        row.innerHTML = `<span>${item.name}</span><strong>${item.price} ر.ع</strong>`;
        cartItemsList.appendChild(row);
    });

    totalPriceElement.textContent = `${currentTotal} ر.ع`;
}

// فتح وإغلاق نافذة السلة
cartBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('سلتك فارغة، أضف بعض المنتجات أولاً!');
    } else {
        cartModal.style.display = 'flex';
    }
});
closeCart.addEventListener('click', () => { cartModal.style.display = 'none'; });

// إرسال كود الدفع ومحاكاته
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const finalAmount = totalPriceElement.textContent;
    alert(`🎉 عملية ناجحة!\nتم دفع مبلغ (${finalAmount}) بمحاكاة آمنة بنجاح من بطاقتك.\nشكرًا لتسوقك من متجر الدبلوماسي.`);
    cart = [];
    updateCartDisplay();
    cartModal.style.display = 'none';
    paymentForm.reset();
});

// 2. تشغيل استمارة تفصيل الدشاديش
if(openTailorBtn) {
    openTailorBtn.addEventListener('click', () => { tailorModal.style.display = 'flex'; });
}
closeTailor.addEventListener('click', () => { tailorModal.style.display = 'none'; });

tailorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('🎯 تم حفظ مقاسات التفصيل وخيارات الخياطة بنجاح في متجر الدبلوماسي! سيتواصل معك الخياط لتأكيد الموعد.');
    tailorModal.style.display = 'none';
    tailorForm.reset();
});

// إغلاق أي نافذة عند الضغط بالخارج
window.addEventListener('click', (e) => {
    if (e.target === tailorModal) tailorModal.style.display = 'none';
    if (e.target === cartModal) cartModal.style.display = 'none';
});