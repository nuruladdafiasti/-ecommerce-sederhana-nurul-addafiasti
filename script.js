// =======================================================
// THE DARK SHOES — LOGIKA KERANJANG, CHECKOUT, KATEGORI, STOK
// =======================================================

// Ambil data keranjang dari localStorage (biar ga hilang kalau refresh)
let cart = JSON.parse(localStorage.getItem('darkShoesCart')) || [];

// Ambil data stok dari localStorage, kalau belum ada, ambil dari HTML (data-stock)
let stokBarang = JSON.parse(localStorage.getItem('darkShoesStok')) || {};

function initStok() {
    document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.btn-add');
        const id = btn.dataset.id;
        if (stokBarang[id] === undefined) {
            const stokEl = card.querySelector('.stock');
            stokBarang[id] = parseInt(stokEl.dataset.stock, 10);
        }
    });
    simpanStok();
}

function simpanStok() {
    localStorage.setItem('darkShoesStok', JSON.stringify(stokBarang));
}

function simpanCart() {
    localStorage.setItem('darkShoesCart', JSON.stringify(cart));
}

// =======================================================
// TAMPILKAN STOK DI SETIAP KARTU PRODUK
// =======================================================
function renderStok() {
    document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.btn-add');
        const id = btn.dataset.id;
        const stokEl = card.querySelector('.stock');
        const sisa = stokBarang[id];

        stokEl.textContent = 'Stok: ' + sisa;
        stokEl.classList.remove('low', 'empty');

        if (sisa <= 0) {
            stokEl.classList.add('empty');
            btn.disabled = true;
            btn.textContent = 'Stok Habis';
        } else if (sisa <= 3) {
            stokEl.classList.add('low');
            btn.disabled = false;
            btn.textContent = 'Tambah ke Keranjang';
        } else {
            btn.disabled = false;
            btn.textContent = 'Tambah ke Keranjang';
        }
    });
}

// =======================================================
// FITUR KATEGORI
// =======================================================
function initFilterKategori() {
    const tombolKategori = document.querySelectorAll('.cat-btn');
    const semuaProduk = document.querySelectorAll('.product-card');
    const emptyMsg = document.getElementById('emptyMsg');

    tombolKategori.forEach(btn => {
        btn.addEventListener('click', () => {
            tombolKategori.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const kategori = btn.dataset.category;
            let tampil = 0;

            semuaProduk.forEach(card => {
                if (kategori === 'semua' || card.dataset.category === kategori) {
                    card.style.display = '';
                    tampil++;
                } else {
                    card.style.display = 'none';
                }
            });

            emptyMsg.style.display = tampil === 0 ? 'block' : 'none';
        });
    });
}

// =======================================================
// FITUR KERANJANG
// =======================================================
function tambahKeKeranjang(id, nama, harga) {
    if (stokBarang[id] <= 0) {
        alert('Maaf, stok ' + nama + ' sudah habis!');
        return;
    }

    const itemAda = cart.find(item => item.id === id);
    const qtyDiKeranjang = itemAda ? itemAda.qty : 0;

    if (qtyDiKeranjang + 1 > stokBarang[id]) {
        alert('Stok ' + nama + ' tidak mencukupi!');
        return;
    }

    if (itemAda) {
        itemAda.qty++;
    } else {
        cart.push({ id, nama, harga, qty: 1 });
    }

    simpanCart();
    renderCart();
    alert(nama + ' telah ditambahkan ke keranjang!');
}

function ubahQty(id, perubahan) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const qtyBaru = item.qty + perubahan;

    if (qtyBaru <= 0) {
        cart = cart.filter(i => i.id !== id);
    } else if (qtyBaru > stokBarang[id]) {
        alert('Stok tidak mencukupi!');
        return;
    } else {
        item.qty = qtyBaru;
    }

    simpanCart();
    renderCart();
}

function hapusItem(id) {
    cart = cart.filter(i => i.id !== id);
    simpanCart();
    renderCart();
}

function renderCart() {
    const cartItemsEl = document.getElementById('cart-items');
    const totalEl = document.getElementById('total');
    const cartCountEl = document.getElementById('cart-count');

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Keranjang masih kosong.</p>';
    } else {
        cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nama}</h4>
                    <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
                    <div class="qty-controls">
                        <button onclick="ubahQty('${item.id}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="ubahQty('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="hapusItem('${item.id}')">Hapus</button>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const jumlahBarang = cart.reduce((sum, item) => sum + item.qty, 0);

    totalEl.textContent = total.toLocaleString('id-ID');
    cartCountEl.textContent = jumlahBarang;
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

// =======================================================
// FITUR CHECKOUT
// =======================================================
function openCheckout() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }

    const summaryEl = document.getElementById('checkout-summary');
    const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);

    summaryEl.innerHTML = cart.map(item =>
        `<p>${item.nama} x${item.qty} — Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</p>`
    ).join('') + `<p style="margin-top:8px;color:#d4af37;font-weight:600;">Total: Rp ${total.toLocaleString('id-ID')}</p>`;

    document.getElementById('checkoutForm').style.display = 'block';
    document.getElementById('checkoutSuccess').style.display = 'none';
    document.getElementById('checkoutOverlay').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
}

function prosesCheckout(e) {
    e.preventDefault();

    const nama = document.getElementById('namaPenerima').value.trim();
    const alamat = document.getElementById('alamatPenerima').value.trim();
    const metode = document.getElementById('metodePembayaran').value;

    if (!nama || !alamat) {
        alert('Mohon lengkapi nama dan alamat pengiriman.');
        return;
    }

    // Kurangi stok sesuai barang yang dibeli
    cart.forEach(item => {
        stokBarang[item.id] = Math.max(0, stokBarang[item.id] - item.qty);
    });
    simpanStok();
    renderStok();

    const total = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const daftarBarang = cart.map(item => `${item.nama} x${item.qty}`).join(', ');

    document.getElementById('orderSummaryText').textContent =
        `Terima kasih, ${nama}!\nPesanan: ${daftarBarang}\nTotal: Rp ${total.toLocaleString('id-ID')}\nPembayaran: ${metode}\nDikirim ke: ${alamat}`;

    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('checkoutSuccess').style.display = 'block';

    // Kosongkan keranjang setelah checkout berhasil
    cart = [];
    simpanCart();
    renderCart();
    document.getElementById('formCheckout').reset();
}

// =======================================================
// INISIALISASI SAAT HALAMAN DIBUKA
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    initStok();
    renderStok();
    initFilterKategori();
    renderCart();

    // Pasang event listener ke semua tombol "Tambah ke Keranjang"
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, name, price } = btn.dataset;
            tambahKeKeranjang(id, name, parseInt(price, 10));
        });
    });

    document.getElementById('formCheckout').addEventListener('submit', prosesCheckout);
});
