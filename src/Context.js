import React, { Component } from 'react';
import {storeProducts, detailProduct} from './data';

const ProductContext = React.createContext();

class ProductProvider extends Component {
    state={
        products:[],
        detailProduct:detailProduct,
        cart : [],
        modalOpen : false,
        modalProduct : detailProduct,
        cartSubtotal : 0,
        cartTax : 0,
        cartTotal : 0
    }


    componentDidMount(){
        this.setProducts();
        
        if(localStorage.getItem("cart") != null){
            this.setState(()=>{
                return {cart : JSON.parse(window.localStorage.getItem("cart")) }
            })
        }else{
            this.setState(()=>{
                return {cart : [] }
            })
        }
    }

    setProducts = () => {
        let tempProducts = [];
        let inCartItem =[];
        var singleItemCart = [];
        let cartSes = [];
        if(JSON.parse(window.localStorage.getItem("cart"))!==null){
            cartSes = JSON.parse(window.localStorage.getItem("cart"));
        }else{
            cartSes = []
        }
       
        storeProducts.forEach(item => {
            var inCart = false;
            
            cartSes.forEach(cartItem => {
                if(item.id !== cartItem.id && inCart === false){
                    inCart = false;
                }else{
                    inCart = true;
                }
            })
                
            if(inCart === false){
                const singleItem = {...item};
                tempProducts = [...tempProducts, singleItem];
            }else{
                let inProduct = false;
                cartSes.forEach(cartItem => {
                    if(item.id === cartItem.id && inProduct === false){
                        const singleItemCart = {...cartItem};
                        tempProducts = [...tempProducts, singleItemCart];
                        inProduct = true;
                    }
                }) 
            }
        });
        this.setState(() => {
            return {products:tempProducts};
        },() => {
            this.addTotals();
           
        }
        );
        
    }

    getItem = id => {
        const product = this.state.products.find(item=> item.id === id);
        return product;
    }

    handleDetail = id => {
        const product = this.getItem(id);
        this.setState(() => {
            return {detailProduct:product}
        })
        
    }
    addToCart = id => {
        let tempProducts = [...this.state.products];
        const index = tempProducts.indexOf(this.getItem(id));
        const product = tempProducts[index];
        product.inCart = true;
        product.count = 1;
        const price = product.price;
        product.total = price;
        this.setState(()=>{
            return {products:tempProducts, cart:[...this.state.cart,product]};
        },
        () => {
            this.addTotals();
           
        }
        )
        console.log(this.state.cart);
        localStorage.setItem('cart', JSON.stringify([...this.state.cart,product]));
        
    }
    openModal = id => {
        const product = this.getItem(id);
        this.setState(()=>{
            return {modalProduct:product, modalOpen:true}
        })
    }
    closeModal = id =>{
        this.setState(()=>{
            return {modalOpen:false}
        })
        
    }
    increase = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item => item.id === id)
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count + 1;
        product.total = product.count * product.price;

        this.setState(()=>{
            return {cart:[...tempCart]}
        },
        ()=>{
            this.addTotals()
        })
        
    }
    decrease = id => {
        let tempCart = [...this.state.cart];
        const selectedProduct = tempCart.find(item => item.id === id)
        const index = tempCart.indexOf(selectedProduct);
        const product = tempCart[index];

        product.count = product.count - 1;
        if(product.count===0){
            this.removeItem(id);
        }else{
            product.total = product.count * product.price;
            this.setState(()=>{
                return {cart:[...tempCart]}
            },
            ()=>{
                this.addTotals()
            })
        }
    }
    removeItem = id => {
        let tempProducts = [...this.state.products];
        let tempCart = [...this.state.cart];

        tempCart = tempCart.filter(item => item.id !== id);

        const index = tempProducts.indexOf(this.getItem(id));
        let removeProduct = tempProducts[index];
        removeProduct.inCart = false ;
        removeProduct.count = 0 ;
        removeProduct.total = 0 ;

        let cartProducts = JSON.parse(window.localStorage.getItem("cart"));
        cartProducts =  cartProducts.filter(item => item.id !== id);
        //const indexCart = cartProducts.indexOf(this.getItem(id));
        //let removeProductCart = cartProducts[indexCart];
        //cartProducts.splice(index, indexCart);
        localStorage.setItem('cart', JSON.stringify(cartProducts));

        console.log(cartProducts);

        this.setState(()=>{
            return {
                cart : [...tempCart],
                products: [...tempProducts]
            };
        },() => {
            this.addTotals();
        })

        
    }
    clearCart = () => {
        this.setState(()=>{
            return {cart:[]};
        },()=> {
            localStorage.removeItem('cart');
            this.setProducts();
            this.addTotals();
            
        });
        
    }
    addTotals = () => {
        let subtotal = 0;
        this.state.cart.map(item => (subtotal += item.total));
        const tempTax = subtotal *0.1;
        const tax = parseFloat(tempTax.toFixed(2));
        const total = subtotal + tax ;
        this.setState(()=> {
            return {
                cartSubtotal : subtotal,
                cartTax : tax,
                cartTotal : total
            }
        })
    }
    render() {
        //this.addTotals();
        return (
            <ProductContext.Provider value={{...this.state, handleDetail:this.handleDetail, addToCart:this.addToCart, openModal:this.openModal, closeModal:this.closeModal,
                increase: this.increase,
                decrease : this.decrease,
                removeItem : this.removeItem,
                clearCart : this.clearCart
            }}>
                {this.props.children}
            </ProductContext.Provider>
        );
    }
}

const ProductConsumer = ProductContext.Consumer;

export {ProductProvider,ProductConsumer};