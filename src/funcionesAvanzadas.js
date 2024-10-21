
const axios = require("axios");
const cheerio = require('cheerio');
const fun = require("./funciones")


let obtenerEmpresasXDescri = async (descri)=>{

    try {

        let busqueda =  descri

        console.log(`Busqueda: ${busqueda}`)

        const response = await axios.post('http://www.aduanet.gob.pe/servlet/CGEmpint', {
            CG_Codigo: "",
            CG_Descri:descri,
            CG_Pais:""
            }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        })

        // console.log(`rpt: ${response.data}`)

        const $ = cheerio.load(response.data);

        const rowsBasic = $('center > table');
        const rows = $(rowsBasic[1]).find('tr')

        let respuestaEnviar = []

        rows.each((index, element) => {

            if(index != 0){

                const row = [];
                let p = $(element).find('td').each((i, el) => {
                  row.push($(el).text().trim());
                    // console.log(` ${i} ) = ${$(el).text()}`)
                });
    
                // console.log(row)
    
                if (row.length == 6) {
                    let empresa = fun.crearEmpresa(row[0], row[1], row[2], row[3], row[4], row[5])
                    respuestaEnviar.push(empresa)
                }

            }

        });
      
        return({
            comentario:"OK",
            rpt: respuestaEnviar
        })



    } catch (error) {
        console.error('Error al hacer scraping:', error);
        console.log("Error al hacer scraping en /prueba/post")

        return({
            comentario: "Error al hacer scraping en /prueba/post",
            rpt:[]
        })
    }


}

let obtenerPlacaYcodEmpresa = async (placa,numEmpresa)=>{

    try {

        let codigoEmpr = fun.normalizacionCodEmpresa(numEmpresa)
    
        if(placa && codigoEmpr){
            
            let {data} = await axios.get(`http://www.aduanet.gob.pe/servlet/CGDetEmpi?cempti=${codigoEmpr}`)
            const $ = cheerio.load(data);
        
            const rows = $('table > tbody > tr');
    
            let rptPlacas = []
    
            rows.each((index, element) => {
    
                const row = [];
                let p = $(element).find('td').each((i, el) => {
                  row.push($(el).text().trim());
                    // console.log(` ${i} ) = ${$(el).text()}`)
                });
    
                let vehiculo = fun.crearPersona(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8])
    
                if(row.length == 9){
                    rptPlacas.push(vehiculo)
                }
    
            });

            // console.log(rptPlacas)


            const indexLocalisable = rptPlacas.findIndex( p => p.placa == placa)
            
            if (indexLocalisable != -1) {
                let rptSolicitud = rptPlacas[indexLocalisable]

                return({
                    comentario : "OK",
                    rpt: rptSolicitud
                })
            } else {
                return({
                    comentario:"NO hay coincidencia",
                    rpt : []
                })
            }
    
            // res.json(rptPlacas)
        }else{
            // res.status(500).send('Error placa o empresa NO ingresados en /PlacaEmpresa/post');
            return({
                comentario:"Error placa o empresa NO ingresados en /PlacaEmpresa/post",
                rpt : []
            })
        }



    } catch (error) {
        console.error('Error al hacer scraping:', error);
        console.log("Error al hacer scraping en /prueba/post")

        return({
            comentario: "Error al hacer scraping en /prueba/post",
            rpt:[]
        })
    }


}

module.exports = { obtenerEmpresasXDescri, obtenerPlacaYcodEmpresa};