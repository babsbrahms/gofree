
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

export const orderStatus = [
    { status: "order", text: 'ORDER RECIEVED', "paid": false, "ready": false },
    { status: "invoice-prep", text: "PREPARING INVOICE", "paid": false, "ready": true },
    { status: "invoice-sent", text: "INVOICE SENT", "paid": false, "ready": true },
    { status: "payment", text: 'PAYMENT RECIEVED', "paid": true, "ready": true },
    { status: "collection", text: "PACKAGE COLLECTED", "paid": true, "ready": true },
    { status: "shipping", text: "PACKAGE SHIPPED", "paid": true, "ready": true },
    { status: "delivery", text: 'PACKAGE DELIVERED', "paid": true, "ready": true },
    { status: "cancelled", text: "ORDER CANCELLED", "paid": true, "ready": true },
]

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


export const nigeriaStates = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    // 'Borno',
    'Cross River',
    'Delta',
    'Ebonyi', 
    'Edo',
    'Ekiti',
    'Enugu',
    'Federal Capital Territory',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna', 
    'Kano', 
    'Katsina', 
    'Kebbi',
    'Kogi', 
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun', 
    'Ondo',
    'Osun',
    'Oyo', 
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara'
];