
export default async function getCount(options) {
    var url = !window.ENV.dev ? window.ENV.functions_url + "getTagCount" + window.ENV.functionSecret : window.ENV.dev_url + "getTagCount";
    let data = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
    if(options){
        data.body = JSON.stringify({
            "tagNumber": options.tagNumber
        })
    }
    var productData = null
    await fetch(url, data)
        .then(res => res.json())
        .then(
            (result) => {
                productData = result
            },
            (error) => {
                productData =  error
            }
        )
        return productData
}