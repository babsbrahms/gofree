
export const orderIcon = {
    "order": 'shopping cart',
    'payment': 'payment',
    "collection": "dolly",
    "shipping": "plane" ,
    "delivery": 'truck',
    "cancelled": "delete"
}

export const orderList = [ 
    "order",
    'payment',
    "collection",
    "shipping",
    "delivery",
    "cancelled"
]

export const orderTite = {
    "order": 'ORDER RECIEVED',
    'payment': 'PAYMENT RECIEVED',
    "collection": "PACKAGE COLLECTED",
    "shipping": "PACKAGE SHIPPED" ,
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