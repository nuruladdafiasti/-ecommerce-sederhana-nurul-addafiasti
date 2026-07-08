let cart=[];

function toggleCart(){

document.getElementById("cartSidebar").classList.toggle("active");

}

function addToCart(nama,harga){

const produk=cart.find(item=>item.nama===nama);

if(produk){

produk.qty++;

}else{

cart.push({

nama:nama,

harga:harga,

qty:1

});

}

updateCart();

}

function updateCart(){

const cartItems=document.getElementById("cart-items");

cartItems.innerHTML="";

let total=0;

let jumlah=0;

cart.forEach((item,index)=>{

jumlah+=item.qty;

total+=item.harga*item.qty;

cartItems.innerHTML+=`

<div class="cart-item">

<div>

<b>${item.nama}</b><br>

Rp ${item.harga.toLocaleString()}

</div>

<div class="qty">

<button onclick="kurang(${index})">-</button>

<span>${item.qty}</span>

<button onclick="tambah(${index})">+</button>

</div>

</div>

`;

});

document.getElementById("cart-count").innerHTML=jumlah;

document.getElementById("total").innerHTML=total.toLocaleString();

}

function tambah(index){

cart[index].qty++;

updateCart();

}

function kurang(index){

if(cart[index].qty>1){

cart[index].qty--;

}else{

cart.splice(index,1);

}

updateCart();

}

function checkout(){

if(cart.length==0){

alert("Keranjang masih kosong!");

return;

}

alert("Checkout berhasil!");

cart=[];

updateCart();

}