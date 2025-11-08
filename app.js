document.addEventListener('DOMContentLoaded', () => {

    // --- 1. تعريف المتغيرات والعناصر ---
    let cart = JSON.parse(localStorage.getItem('abo0odiCart')) || [];
    const phoneNumber = '905061997710'; 

    // عناصر السلة
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartCounter = document.getElementById('cart-counter');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    
    // عناصر المنتجات
    const mainProductsGrid = document.getElementById('all-products-grid'); 
    const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPa6WPFhppRsBLPOra9BMHHtrooU_sNmWX2eQG7F1EPUTD9MAX3LHT61iqX448Wt2gEchNHWth7Pze/pub?gid=0&single=true&output=csv';
    
    // عناصر التقييمات والسلايدر
    const reviewForm = document.getElementById('review-form');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const formMessage = document.getElementById('form-message');
    const slider = document.getElementById('reviews-slider');
    const prevBtn = document.getElementById('slide-prev');
    const nextBtn = document.getElementById('slide-next');
    let autoplayTimer; 
    let currentReviewIndex = 0; 
    let allReviews = []; 

    // ==== تعديل JS: (التوجل) إضافة عناصر القائمة المنسدلة ====
    const dropdownToggle = document.getElementById('products-dropdown-toggle');
    const dropdownMenu = document.getElementById('products-dropdown-menu');
    const dropdownLinks = dropdownMenu.querySelectorAll('a.btn-list');
    // ==== نهاية تعديل JS ====


    /* !! الصق الروابط هنا !! */
    const reviewSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPa6WPFhppRsBLPOra9BMHHtrooU_sNmWX2eQG7F1EPUTD9MAX3LHT61iqX448Wt2gEchNHWth7Pze/pub?gid=169688022&single=true&output=csv'; 
    const reviewAppURL = 'https://script.google.com/macros/s/AKfycbyhInciVkZyALQb8RZ-OGuxtcdHaMZDvlYTm1aS3NItr9X5WL9D1clhp5kVQ3q1wwXr/exec'; 
    /* !! نهاية قسم الروابط !! */


    // --- وظيفة حفظ السلة ---
    function saveCartToLocalStorage() {
        localStorage.setItem('abo0odiCart', JSON.stringify(cart));
    }

    // --- وظيفة تحديث واجهة السلة ---
    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let whatsappMessage = "مرحباً، أرغب في طلب المنتجات التالية:\n\n";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-msg">السلة فارغة حالياً.</p>';
            cartCounter.classList.add('hidden');
        } else {
            cartCounter.classList.remove('hidden');
            cartCounter.textContent = cart.length;
            cart.forEach((item, index) => {
                total += item.price; 
                whatsappMessage += `*${index + 1}. ${item.name}*\n    - السعر: ${item.price.toFixed(2)} $\n`;
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-details">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">${item.price.toFixed(2)} $</p>
                    </div>
                    <button class="cart-item-remove-btn" data-index="${index}">
                        &times;
                    </button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);
        whatsappMessage += `\n*المجموع الكلي: ${total.toFixed(2)} $*`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        checkoutBtn.href = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    }

    // --- وظائف السلة ---
    function addToCart(product) {
        cart.push(product);
        updateCartUI();
        saveCartToLocalStorage();
        openCartBtn.style.transform = 'scale(1.2)';
        openCartBtn.style.color = 'var(--primary)';
        setTimeout(() => {
            openCartBtn.style.transform = 'scale(1)';
            openCartBtn.style.color = 'var(--text-color)';
        }, 300);
    }
    function removeFromCart(index) {
        cart.splice(index, 1); 
        updateCartUI();
        saveCartToLocalStorage();
    }
    function clearCart() {
        cart = []; 
        updateCartUI();
        saveCartToLocalStorage();
        closeCart(); 
    }
    function openCart() {
        cartModal.classList.add('open');
        cartOverlay.classList.add('open');
    }
    function closeCart() {
        cartModal.classList.remove('open');
        cartOverlay.classList.remove('open');
    }

    // --- ربط أحداث أزرار السلة ---
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    clearCartBtn.addEventListener('click', clearCart);
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('cart-item-remove-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            removeFromCart(index);
        }
    });

    // --- وظائف المنتجات ---
    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.btnproduct'); 
        addToCartButtons.forEach(button => {
            if (button.dataset.listenerAttached) return; 
            button.dataset.listenerAttached = true;

            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const name = productCard.querySelector('.product-name').textContent;
                const priceString = productCard.querySelector('.price').textContent;
                const price = parseFloat(priceString.replace(' $', '').trim());
                const product = { name, price };
                addToCart(product);
            });
        });
    }

    function displayProducts(products, targetGridElement) {
        if (!targetGridElement) return; 

        targetGridElement.innerHTML = ''; 

        if (products.length === 0) {
            targetGridElement.innerHTML = '<p style="text-align:center; color: var(--gray); padding: 20px 0;">لا توجد منتجات في هذا القسم حالياً.</p>';
            return;
        }

        products.forEach(product => {
            const nameStyle = (product.nameSize && product.nameSize.trim() !== '') ? `style="font-size: ${product.nameSize}"` : '';
            const descStyle = (product.descSize && product.descSize.trim() !== '') ? `style="font-size: ${product.descSize}"` : '';
            const productCardHTML = `
            <div class="product-card">
              <div class="product-image">
                <img src="${product.imageURL}" alt="${product.name}" />
              </div>
              <div class="product-info">
                <div class="product-name" ${nameStyle}>${product.name}</div>
                <div class="product-sub">${product.sub}</div>
                <div class="product-desc" ${descStyle}>${product.desc}</div>
                <div class="product-price">
                  <span class="price">${parseFloat(product.price).toFixed(2)} $</span>
                  <span class="old-price">${product.oldPrice}</span>
                </div>
                <button class="btn btnproduct">أضف إلى السلة</button>
              </div>
            </div>`;
            targetGridElement.innerHTML += productCardHTML;
        });
    }


    async function fetchProducts() {
        try {
            if(mainProductsGrid) {
                mainProductsGrid.innerHTML = '<p style="text-align:center; font-size: 1.2rem; color: var(--primary);">...جاري تحميل المنتجات...</p>';
            }
            
            const response = await fetch(googleSheetURL + '&_t=' + new Date().getTime());
            if (!response.ok) throw new Error('فشل الاتصال بملف البيانات');
            
            const csvText = await response.text();
            const lines = csvText.split('\n').slice(1); 
            
            const allProducts = lines
                .filter(line => line && line.trim() !== '') 
                .map(line => {
                    const [name, sub, desc, price, oldPrice, imageURL, nameSize, descSize] = line.trim().split(',');
                    const safeSub = sub ? sub.trim() : ''; 
                    return { name, sub: safeSub, desc, price, oldPrice, imageURL, nameSize, descSize };
                })
                .filter(p => p && p.name && p.name.trim() !== '');

            if(mainProductsGrid) {
                displayProducts(allProducts, mainProductsGrid);
            }

            const categories = {
                'SM': 'sm-grid',
                'PCG': 'pcg-grid',
                'MS': 'ms-grid',
                'DM': 'dm-grid',
                'PCT': 'pct-grid',
                'MSF': 'msf-grid'
            };

            for (const [subCode, gridId] of Object.entries(categories)) {
                const categoryProducts = allProducts.filter(p => p.sub.split('|').includes(subCode));
                const targetGrid = document.getElementById(gridId);
                
                if (targetGrid) {
                    displayProducts(categoryProducts, targetGrid);
                } else {
                    console.warn(`لم يتم العثور على شبكة العرض بالـ ID: ${gridId}`);
                }
            }

            setupAddToCartButtons();

        } catch (error) {
            console.error('حدث خطأ:', error);
            if(mainProductsGrid) {
                mainProductsGrid.innerHTML = '<p style="text-align:center; font-size: 1.2rem; color: red;">حدث خطأ أثناء تحميل المنتجات. تأكد من صحة الرابط.</p>';
            }
        }
    }


    // ==== بداية وظائف التقييمات والسلايدر (معدلة) ====
    
    function createStarRating(rating) {
        let starsHTML = '';
        let numRating = parseInt(rating, 10);
        for (let i = 1; i <= 5; i++) {
            starsHTML += i <= numRating ? '<i class="fas fa-star"></i>' : '<i class="fas fa-star empty"></i>';
        }
        return starsHTML;
    }

    function displayReviews(reviews) {
        slider.innerHTML = ''; 
        if (reviews.length === 0) {
            slider.innerHTML = '<p style="text-align:center; color: var(--gray); padding: 20px;">لا توجد تقييمات حالياً. كن أول من يضيف تقييم!</p>';
            return;
        }
        
        allReviews = reviews.slice().reverse(); 
        
        let allReviewsHTML = '';
        allReviews.forEach(review => {
            const ratingHTML = createStarRating(review.rating);
            const reviewDate = new Date(review.timestamp).toLocaleDateString('ar-SA'); 
            
            allReviewsHTML += `
            <div class="review-card">
                <div class="review-card-header">
                    <h3 class="review-card-name">${review.name}</h3>
                    <div class="review-card-rating">${ratingHTML}</div>
                </div>
                <p class="review-card-comment">${review.comment}</p>
                <div class="review-card-timestamp">${reviewDate}</div>
            </div>`;
        });
        
        slider.innerHTML = allReviewsHTML;
        setupSlider(); 
    }

    function setupSlider() {
        currentReviewIndex = 0; 
        const slides = slider.querySelectorAll('.review-card');
        
        if (slides.length > 1) { 
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';

            function updateSliderPosition() {
                slider.style.transform = `translateX(${currentReviewIndex * 100}%)`; 
            }

            function showNext() {
                currentReviewIndex = (currentReviewIndex - 1 + slides.length) % slides.length; 
                updateSliderPosition();
            }

            function showPrev() {
                currentReviewIndex = (currentReviewIndex + 1) % slides.length; 
                updateSliderPosition();
            }

            function startAutoplay() {
                stopAutoplay(); 
                autoplayTimer = setInterval(showNext, 5000); 
            }

            function stopAutoplay() {
                clearInterval(autoplayTimer);
            }

            nextBtn.addEventListener('click', () => {
                showPrev(); 
                stopAutoplay(); 
            });
            prevBtn.addEventListener('click', () => {
                showNext(); 
                stopAutoplay();
            });
            
            const sliderWrapper = document.querySelector('.reviews-slider-wrapper');
            sliderWrapper.addEventListener('mouseenter', stopAutoplay);
            sliderWrapper.addEventListener('mouseleave', startAutoplay);

            startAutoplay(); 
            updateSliderPosition();

        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }


    async function fetchReviews() {
        clearInterval(autoplayTimer); 
        
        try {
            slider.innerHTML = '<p style="text-align:center; color: var(--primary); padding: 20px;">...جاري تحميل التقييمات...</p>';
            const response = await fetch(reviewSheetURL + '&_t=' + new Date().getTime());
            if (!response.ok) throw new Error('فشل الاتصال بملف التقييمات');
            
            const csvText = await response.text();
            const lines = csvText.split('\n').slice(1);
            
            const reviews = lines
                .filter(line => line && line.trim() !== '')
                .map(line => {
                    const [name, rating, timestamp, comment] = line.trim().split(',');
                    return { name, rating, timestamp, comment }; 
                })
                .filter(r => r && r.name && r.rating);
                
            displayReviews(reviews);
            
        } catch (error) {
            console.error('خطأ في جلب التقييمات:', error);
            slider.innerHTML = '<p style="text-align:center; color: red; padding: 20px;">حدث خطأ أثناء تحميل التقييمات.</p>';
        }
    }

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        submitReviewBtn.disabled = true;
        submitReviewBtn.textContent = '...جاري الإرسال...';
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        
        try {
            const name = document.getElementById('reviewer-name').value;
            const comment = document.getElementById('reviewer-comment').value; 
            const rating = new FormData(reviewForm).get('rating');
            
            if (!rating || !name || !comment) {
                throw new Error("الرجاء ملء جميع الحقول (الاسم، التعليق، والنجوم)");
            }
            
            const response = await fetch(reviewAppURL, {
                method: 'POST',
                mode: 'no-cors', 
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name, rating: rating, comment: comment })
            });

            formMessage.textContent = 'شكراً لك، تم إرسال تقييمك بنجاح!';
            formMessage.classList.add('success');
            reviewForm.reset(); 
            
            clearInterval(autoplayTimer);
            setTimeout(fetchReviews, 1000); 
            
        } catch (error) {
            console.error('خطأ في إرسال التقييم:', error);
            formMessage.textContent = error.message.includes("الحقول") ? error.message : 'حدث خطأ. الرجاء المحاولة مرة أخرى.';
            formMessage.classList.add('error');
        } finally {
            submitReviewBtn.disabled = false;
            submitReviewBtn.textContent = 'إرسال التقييم';
        }
    });

    // ==== نهاية وظائف التقييمات ====

    // --- 5. التشغيل الأولي ---
    fetchProducts(); 
    fetchReviews(); 
    updateCartUI(); 

    // ==== بداية: تعديل JS (التوجل) - إضافة منطق القائمة المنسدلة ====

    // 1. فتح وإغلاق القائمة عند الضغط على الزر
    if(dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault(); // منع الرابط من القفز للصفحة
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
            }
        });
    }

    // 2. إغلاق القائمة عند الضغط على أي رابط بداخلها
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        });
    });

    // 3. (اختياري) إغلاق القائمة عند الضغط في أي مكان آخر في الصفحة
    window.addEventListener('click', (e) => {
        // تحقق إذا كان الضغط خارج الزر وخارج القائمة
        if (dropdownMenu && dropdownToggle && !dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    // ==== نهاية: تعديل JS ====

});
