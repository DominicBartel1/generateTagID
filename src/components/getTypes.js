
export default async function getTypes(options, callback) {
    var url = !window.ENV.dev ? window.ENV.functions_url + "getProductTypes" + window.ENV.functionSecret : window.ENV.dev_url + "getProductTypes";
    let data = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
    if(options){
        data.body = JSON.stringify({
            "productNumber": options.productNumber
        })
    }
    var productData = null
    await fetch(url, data)
        .then(res => res.json())
        .then(
            (result) => {
                if(result.length < 1){
                    result.error = "Barcode references incorrect value";
                }
                if (!result.error) {
                    productData = {}
                    for (var productIndex in result) {
                        productData[result[productIndex].tagNumber] = {
                            productName: result[productIndex].label,
                            selected: true,
                        };
                    }
                } else {
                    //show error that gathering productData failed
                    productData = result.error
                }
            },
            (error) => {
                productData =  error
            }
        )
        return productData
}