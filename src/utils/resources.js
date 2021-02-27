
export const orderIcon = {
    "order": 'shopping cart',
    "invoice-prep": "file alternate",
    "invoice-sent": "clipboard check",
    'payment': 'payment',
    "collection": "dolly",
    "shipping": "plane" ,
    "delivery": 'truck',
    "cancelled": "delete"
}

export const orderList = [ 
    "order",
    "invoice-prep",
    "invoice-sent",
    'payment',
    "collection",
    "shipping",
    "delivery",
    "cancelled"
]

export const orderTite = {
    "order": 'ORDER RECIEVED',
    "invoice-prep": "PREPARING INVOICE",
    "invoice-sent": "INVOICE SENT",
    'payment': 'PAYMENT RECIEVED',
    "collection": "PACKAGE COLLECTED",
    "shipping": "PACKAGE SHIPPED",
    "delivery": 'PACKAGE DELIVERED',
    "cancelled": "ORDER CANCELLED"
}

export const getUrlParams = (params = "") => {
    let obj = {};
    if (params && params.startsWith("?")) {
        let vals = params.slice(1)
        vals.split("&").forEach(str => {
            obj[str.split("=")[0]] = str.split("=")[1]
        })
    }
    return obj
}


export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]