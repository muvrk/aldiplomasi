// حالة المتجر والسلة
let cart = [];
let discountPercentage = 0; 
let currentSelectedFabric = { name: "عادي (مشمول)", price: 0 };
let currentCategory = 'all';

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
const selectedFabricNotice = document.getElementById('selectedFabricNotice');

// --- 1. ميزة الوضع الليلي الفخم (Dark Mode) ---
const darkModeBtn = document.getElementById('darkModeBtn');
// التحقق من تفضيل العميل المحفوظ سابقاً
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeBtn.textContent = '☀️ الوضع العادي';
}

darkModeBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        darkModeBtn.textContent = '🌙 الوضع الليلي';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        darkModeBtn.textContent = '☀️ الوضع العادي';
    }
});

// --- 2. ميزة العداد التنازلي الحقيقي لشعور الحماس ---
function startCountdown(durationInSeconds) {
    let timer = durationInSeconds;
    const display = document.getElementById('countdown');
    
    setInterval(() => {
        let hours = parseInt(timer / 3600, 10);
        let minutes = parseInt((timer % 3600) / 60, 10);
        let seconds = parseInt(timer % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = hours + ":" + minutes + ":" + seconds;

        if (--timer < 0) {
            timer = durationInSeconds; // إعادة تصفير العداد عند الانتهاء
        }
    }, 1000);
}
startCountdown(7200); // عداد تنازلي لمدة ساعتين مكررة تلقائياً

// --- 3. محرك البحث وفلاتر التصنيف الذكية لايف ---
function filterProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#productsGrid .product-card');

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const category = card.getAttribute('data-category');
        
        const matchesSearch = title.includes(query);
        const matchesCategory = (currentCategory === 'all' || category === currentCategory);

        if (matchesSearch && matchesCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterCategory(categoryName) {
    currentCategory = categoryName;
    
    // تغيير شكل الزر النشط
    const buttons = document.querySelectorAll('.btn-filter');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    filterProducts();
}

// اختيارات الأقمشة
function selectFabric(fabricName, fabricPrice) {
    currentSelectedFabric.name = fabricName;
    currentSelectedFabric.price = fabricPrice;
    selectedFabricNotice.textContent = `القماش المختار: ${fabricName} (+ ${fabricPrice} ر.ع)`;
    alert(`🎯 تم اختيار قماش (${fabricName}) بنجاح! سيتم ربطه بدشداشة التفصيل عند تعبئة المقاسات بالأسفل.`);
    document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' });
}

// إضافة المنتجات الجاهزة للسلة
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const productCard = e.target.parentElement;
        const productName = productCard.querySelector('h3').textContent;
        const productPriceText = productCard.querySelector('.price').textContent;
        const productPrice = parseInt(productPriceText.replace(/[^0-9]/g, ''));

        addToCart(productName, productPrice);
        
        button.textContent = 'تمت الإضافة! ✓';
        button.style.backgroundColor = '#2ecc71';
        setTimeout(() => {
            button.textContent = 'أضف للسلة';
            button.style.backgroundColor = '#c0392b';
        }, 1500);
    });
});

// استمارة التفصيل
tailorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const sewingType = document.getElementById('sewingType').value;
    const finalPrice = 25 + currentSelectedFabric.price;
    const description = `دشداشة تفصيل (${sewingType}) - قماش: ${currentSelectedFabric.name}`;

    addToCart(description, finalPrice);
    
    alert('🎯 تم حفظ المقاسات وخيارات التفصيل وإضافتها مباشرة إلى الفاتورة!');
    tailorModal.style.display = 'none';
    tailorForm.reset();
    currentSelectedFabric = { name: "عادي (مشمول)", price: 0 };
    selectedFabricNotice.textContent = `القماش المختار: عادي (مشمول في السعر الأصلي)`;
});

// دالة إضافة بند جديد للسلة أو زيادة الكمية
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
    }
    updateCartDisplay();
}

// دالة التحكم في الكميات والحذف داخل السلة (التحديث الذكي الفوري)
function changeQuantity(index, action) {
    if (action === 'increase') {
        cart[index].quantity += 1;
    } else if (action === 'decrease') {
        cart[index].quantity -= 1;
        if (cart[index].quantity === 0) {
            cart.splice(index, 1);
        }
    }
    updateCartDisplay();
}

function deleteItem(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// دالة تحديث السلة وحساب الإجمالي النهائي
function updateCartDisplay() {
    // حساب مجموع العناصر الكلي للعداد في الهيدر
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBtn.textContent = `🛒 السلة (${totalCount})`;
    
    cartItemsList.innerHTML = '';
    let subTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subTotal += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div style="flex: 1; padding-left: 10px;">
                <div style="font-weight: bold; font-size:0.85rem;">${item.name}</div>
                <div style="color:#d4af37; font-size:0.85rem;">${item.price} ر.ع</div>
            </div>
            <div class="quantity-controls">
                <button type="button" class="btn-qty" onclick="changeQuantity(${index}, 'decrease')">-</button>
                <span>${item.quantity}</span>
                <button type="button" class="btn-qty" onclick="changeQuantity(${index}, 'increase')">+</button>
                <button type="button" class="btn-delete" onclick="deleteItem(${index})">🗑️</button>
            </div>
        `;
        cartItemsList.appendChild(row);
    });

    let discountAmount = subTotal * discountPercentage;
    let finalTotal = subTotal - discountAmount;

    if(discountPercentage > 0) {
        const discountRow = document.createElement('div');
        discountRow.style.display = 'flex';
        discountRow.style.justifyContent = 'space-between';
        discountRow.style.color = '#2ecc71';
        discountRow.style.fontWeight = 'bold';
        discountRow.style.margin = '10px 0';
        discountRow.innerHTML = `<span>خصم الكوبون (10%):</span><span>-${discountAmount.toFixed(1)} ر.ع</span>`;
        cartItemsList.appendChild(discountRow);
    }

    totalPriceElement.textContent = `${finalTotal.toFixed(1)} ر.ع`;
}

// تطبيق الكوبون
function applyCoupon() {
    const couponInput = document.getElementById('couponInput').value.trim();
    const couponMessage = document.getElementById('couponMessage');

    if(couponInput === 'OMAN2026') {
        discountPercentage = 0.10;
        couponMessage.style.color = '#2ecc71';
        couponMessage.textContent = '✓ تم تطبيق الكوبون بنجاح! خصم 10% على إجمالي الفاتورة.';
        updateCartDisplay();
    } else {
        couponMessage.style.color = '#c0392b';
        couponMessage.textContent = '❌ الكوبون غير صحيح.';
    }
}

// --- 4. ميزة تذكير السلة المتروكة الذكية (عند محاولة الخروج) ---
window.addEventListener('beforeunload', (e) => {
    if (cart.length > 0) {
        // نضع رسالة تنبيهية تظهر في بعض المتصفحات عند قفل التبويب
        const msg = "يا دبلوماسي، نسيت أغراضك في السلة! استخدم كود OMAN2026 للحصول على خصم قبل مغادرتك.";
        e.returnValue = msg;
        return msg;
    }
});

// --- 5. نظام الإشعارات الحية التلقائية في زاوية الشاشة ---
const notifications = [
    "قام زبون من مسقط بشراء غترة الدبلوماسي البيضاء قبل قليل! 🛍️",
    "زبون من صحار حجز موعد تفصيل دشداشة خنجرية فاخرة 🎯",
    "تحديث: تم حجز آخر قطعة من قماش القطن الياباني الممتاز! 🧵",
    "قام زبون من شناص بشراء نظارة شمسية كلاسيك فاخرة 🕶️"
];

function showLiveNotification() {
    const toast = document.getElementById('toastNotification');
    // اختيار إشعار عشوائي من القائمة
    const randomMsg = notifications[Math.floor(Math.random() * notifications.length)];
    
    toast.textContent = randomMsg;
    toast.classList.add('show');
    
    // إخفاء الإشعار بعد 4 ثوانٍ
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
// تشغيل الإشعارات الحية كل 25 ثانية لتعطي إيحاء بحركة المحل وزيادة الرغبة بالشراء
setInterval(showLiveNotification, 25000);
// تشغيل أول إشعار بعد 5 ثوانٍ من دخول الموقع
setTimeout(showLiveNotification, 5000);


// فتح وإغلاق النوافذ
cartBtn.addEventListener('click', () => {
    if (cart.length === 0) { alert('سلتك فارغة، أضف مستلزماتك الفاخرة أولاً!'); } else { cartModal.style.display = 'flex'; }
});
closeCart.addEventListener('click', () => { cartModal.style.display = 'none'; });

if(openTailorBtn) { openTailorBtn.addEventListener('click', () => { tailorModal.style.display = 'flex'; }); }
closeTailor.addEventListener('click', () => { tailorModal.style.display = 'none'; });

paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`🎉 عملية ناجحة!\nتم دفع مبلغ (${totalPriceElement.textContent}) بمحاكاة آمنة بنجاح من بطاقتك.\nشكرًا لتسوقك من متجر الدبلوماسي.`);
    cart = []; discountPercentage = 0;
    document.getElementById('couponMessage').textContent = '';
    document.getElementById('couponInput').value = '';
    updateCartDisplay();
    cartModal.style.display = 'none';
    paymentForm.reset();
});

window.addEventListener('click', (e) => {
    if (e.target === tailorModal) tailorModal.style.display = 'none';
    if (e.target === cartModal) cartModal.style.display = 'none';
});