// =======================================================
// THE DARK SHOES — LOGIKA KERANJANG, CHECKOUT, KATEGORI, STOK, DETAIL
// =======================================================

let cart = JSON.parse(localStorage.getItem('darkShoesCart')) || [];
let stokBarang = JSON.parse(localStorage.getItem('darkShoesStok')) || {};

const DATA_VERSION = 'v3'; // ganti angka ini (v3, v4, dst) setiap kali kamu ubah stok di HTML

function initStok() {
    const versiTersimpan = localStorage.getItem('darkShoesStokVersion');

    if (versiTersimpan !== DATA_VERSION) {
        stokBarang = {};
        document.querySelectorAll('.product-card').forEach(card => {
            const btn = card.querySelector('.btn-add');
            const id = btn.dataset.id;
            const stokEl = card.querySelector('.stock');
            stokBarang[id] = parseInt(stokEl.dataset.stock, 10);
        });
        localStorage.setItem('darkShoesStokVersion', DATA_VERSION);
    } else {
        document.querySelectorAll('.product-card').forEach(card => {
            const btn = card.querySelector('.btn-add');
            const id = btn.dataset.id;
            if (stokBarang[id] === undefined) {
                const stokEl = card.querySelector('.stock');
                stokBarang[id] = parseInt(stokEl.dataset.stock, 10);
            }
        });
    }

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
// FITUR MODAL DETAIL PRODUK
// =======================================================
function initDetailModal() {
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const addBtn = card.querySelector('.btn-add');
            const img = card.querySelector('img');

            document.getElementById('detailImg').src = img.src;
            document.getElementById('detailImg').alt = img.alt;
            document.getElementById('detailNama').textContent = addBtn.dataset.name;
            document.getElementById('detailHarga').textContent =
                'Rp ' + parseInt(addBtn.dataset.price, 10).toLocaleString('id-ID');
            document.getElementById('detailStok').textContent =
                card.querySelector('.stock').textContent;
            document.getElementById('detailDesc').textContent =
                card.dataset.desc || 'Belum ada deskripsi untuk produk ini.';
            document.getElementById('detailSizeSelect').value = '';

           const tombolTambah = document.getElementById('detailAddBtn');
tombolTambah.onclick = () => {
    const ukuran = document.getElementById('detailSizeSelect').value;
     tambahKeKeranjang(addBtn.dataset.id, addBtn.dataset.name, parseInt(addBtn.dataset.price, 10), ukuran, img.src);
    if (ukuran) {
        document.getElementById('detailSizeSelect').value = '';
        closeDetail();
    }
};
            document.getElementById('detailOverlay').classList.add('active');
        });
    });
}

function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('active');
}

// =======================================================
// FITUR KERANJANG
// =======================================================
function tambahKeKeranjang(id, nama, harga, ukuran, gambar) {
    if (!ukuran) {
        alert('Mohon pilih ukuran terlebih dahulu untuk ' + nama + '!');
        return;
    }

    if (stokBarang[id] <= 0) {
        alert('Maaf, stok ' + nama + ' sudah habis!');
        return;
    }

    const cartId = id + '-' + ukuran; // id unik per produk+ukuran
    const itemAda = cart.find(item => item.cartId === cartId);
    const qtyDiKeranjang = itemAda ? itemAda.qty : 0;

    if (qtyDiKeranjang + 1 > stokBarang[id]) {
        alert('Stok ' + nama + ' tidak mencukupi!');
        return;
    }

    if (itemAda) {
        itemAda.qty++;
    } else {
        cart.push({ cartId, id, nama, harga, ukuran, gambar, qty: 1 });
    }

    simpanCart();
    renderCart();
    alert(nama + ' (Ukuran ' + ukuran + ') telah ditambahkan ke keranjang!');
}

function ubahQty(cartId, perubahan) {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;

    const qtyBaru = item.qty + perubahan;

    if (qtyBaru <= 0) {
        cart = cart.filter(i => i.cartId !== cartId);
    } else if (qtyBaru > stokBarang[item.id]) {
        alert('Stok tidak mencukupi!');
        return;
    } else {
        item.qty = qtyBaru;
    }

    simpanCart();
    renderCart();
}

function hapusItem(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
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
                    <h4>${item.nama} <span style="color:#999;">(Uk. ${item.ukuran})</span></h4>
                    <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
                    <div class="qty-controls">
                        <button onclick="ubahQty('${item.cartId}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="ubahQty('${item.cartId}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="hapusItem('${item.cartId}')">Hapus</button>
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
const subtotal = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
const ongkir = 15000;
const total = subtotal + ongkir;

summaryEl.innerHTML = cart.map(item =>
    `<p>${item.nama} x${item.qty} — Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</p>`
).join('') 
+ `<p style="margin-top:8px;">Ongkos Kirim: Rp ${ongkir.toLocaleString('id-ID')}</p>`
+ `<p style="margin-top:4px;color:#ffffff;font-weight:600;">Total: Rp ${total.toLocaleString('id-ID')}</p>`;

    document.getElementById('checkoutForm').style.display = 'block';
    document.getElementById('checkoutOverlay').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkoutOverlay').classList.remove('active');
}

function prosesCheckout(e) {
    e.preventDefault();

    const nama = document.getElementById('namaPenerima').value.trim();
    const telepon = document.getElementById('teleponPenerima').value.trim();
    const alamat = document.getElementById('alamatPenerima').value.trim();
    const metode = document.getElementById('metodePembayaran').value;

    if (!nama) {
        alert('Mohon isi nama penerima terlebih dahulu.');
        document.getElementById('namaPenerima').focus();
        return;
    }
    if (!telepon) {
        alert('Mohon isi nomor telepon terlebih dahulu.');
        document.getElementById('teleponPenerima').focus();
        return;
    }
    if (!alamat) {
        alert('Mohon isi alamat pengiriman terlebih dahulu.');
        document.getElementById('alamatPenerima').focus();
        return;
    }

    // Kurangi stok
    cart.forEach(item => {
        stokBarang[item.id] = Math.max(0, stokBarang[item.id] - item.qty);
    });
    simpanStok();
    renderStok();

    // Hitung total
    const subtotal = cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
    const jumlahItem = cart.reduce((sum, item) => sum + item.qty, 0);
    const ongkir = 15000;
    const total = subtotal + ongkir;

    // Nomor pesanan otomatis
    const now = new Date();
    const tanggalKode = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const nomorPesanan = '#TD' + tanggalKode + '-' + String(Math.floor(Math.random() * 900) + 100);

    const tanggalTampil = now.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Isi header sukses
    document.getElementById('spNomor').textContent = nomorPesanan;
    document.getElementById('spTanggal').textContent = tanggalTampil;

    // Isi daftar produk
    const produkListEl = document.getElementById('spProdukList');
    produkListEl.innerHTML = cart.map(item => `
        <div class="produk-item">
            <img src="${item.gambar || ''}" alt="${item.nama}">
            <div class="produk-item-info">
                <h5>${item.nama}</h5>
                <span>Ukuran: ${item.ukuran} &nbsp;•&nbsp; x${item.qty}</span>
            </div>
            <div class="produk-item-harga">Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</div>
        </div>
    `).join('');

    // Isi info pengiriman & pembayaran
    document.getElementById('spNama').textContent = nama;
    document.getElementById('spTelepon').textContent = telepon;
    document.getElementById('spAlamat').textContent = alamat;
    document.getElementById('spMetode').textContent = metode;

    // Isi ringkasan pembayaran
    document.getElementById('spJumlahLabel').textContent = `Subtotal (${jumlahItem} Produk)`;
    document.getElementById('spSubtotal').textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
    document.getElementById('spOngkir').textContent = 'Rp ' + ongkir.toLocaleString('id-ID');
    document.getElementById('spTotal').textContent = 'Rp ' + total.toLocaleString('id-ID');

    // Tutup modal checkout, buka halaman sukses
    document.getElementById('checkoutOverlay').classList.remove('active');
    document.getElementById('successPage').classList.add('active');
    window.scrollTo(0, 0);

    // Reset keranjang
    cart = [];
    simpanCart();
    renderCart();
    document.getElementById('formCheckout').reset();
}

function closeSuccessPage() {
    document.getElementById('successPage').classList.remove('active');
}

function scrollToDetail() {
    document.getElementById('successDetailSection').scrollIntoView({ behavior: 'smooth' });
}

// =======================================================
// INISIALISASI SAAT HALAMAN DIBUKA
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
    initStok();
    renderStok();
    initFilterKategori();
    initDetailModal();
    renderCart();

   document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
        const { id, name, price } = btn.dataset;
        const card = btn.closest('.product-card');
        const sizeSelect = card.querySelector('.size-select');
        const ukuran = sizeSelect.value;
        const gambar = card.querySelector('img').src;
        tambahKeKeranjang(id, name, parseInt(price, 10), ukuran, gambar);
        if (ukuran) sizeSelect.value = '';
    });
});

    document.getElementById('formCheckout').addEventListener('submit', prosesCheckout);
});
