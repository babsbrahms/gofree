
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

 export const ukStates = [
    'Avon',
    'Bedfordshire',
    'Berkshire',
    'Buckinghamshire',
    'Cambridgeshire',
    'Cheshire',
    'Cleveland',
    'Cornwall',
    'Cumbria',
    'Derbyshire',
    'Devon',
    'Dorset',
    'Durham',
    'East Sussex',
    'Essex',
    'Gloucestershire',
    'Hampshire',
    'Herefordshire',
    'Hertfordshire',
    'Isle of Wight',
    'Kent',
    'Lancashire',
    'Leicestershire',
    'Lincolnshire',
    'London',
    'Merseyside',
    'Middlesex',
    'Norfolk',
    'Northamptonshire',
    'Northumberland',
    'North Humberside',
    'North Yorkshire',
    'Nottinghamshire',
    'Oxfordshire',
    'Rutland',
    'Shropshire',
    'Somerset',
    'South Humberside',
    'South Yorkshire',
    'Staffordshire',
    'Suffolk',
    'Surrey',
    'Tyne and Wear',
    'Warwickshire',
    'West Midlands',
    'West Sussex',
    'West Yorkshire',
    'Wiltshire',
    'Worcestershire'
]

export let deliveryOptions =  nigeriaStates.map(x => ({ key: x, text: x, value: x, rate: x=== 'Lagos'? 4.5 : 5.5 }))

export let calcUnitPrice = (length, width, height, weight, type, rate) => {

    const parcelCalc = (length, width, height, weight) => {
        let vol = (length* width * height) / 6000;

        if (weight > vol) {
            return weight * rate
        } else {
            let calcDetail = vol - weight;
            return (weight + (calcDetail * 0.5)) * rate
        }

    }

    const documentCalc = (length, width, height, weight) => {
        let vol = (length* width * height) / 5000;

        if (weight > vol) {
            return weight * rate
        } else {
            let calcDetail = vol - weight;
            return (weight + (calcDetail * 0.5)) * rate
        }

    }

    if (type === 'parcel') {
       return parcelCalc(length, width, height, weight)
    } else {
        return documentCalc(length, width, height, weight)
    }
}