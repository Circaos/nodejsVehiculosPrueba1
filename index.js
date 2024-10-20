const express = require("express");
const axios = require("axios");
const cheerio = require('cheerio');
const fun = require("./funciones")
const FormData = require('form-data');

const app = express()

app.set("appName","Express Course")
app.set("port",3000)

//Funciones 
app.use(express.text())
app.use(express.json())


app.get("/prueba/:codEmpresa",async (req,res)=>{

    try {
        let codigoEmpr = fun.normalizacionCodEmpresa(req.params.codEmpresa)
    
        let {data} = await axios.get(`http://www.aduanet.gob.pe/servlet/CGDetEmpi?cempti=${codigoEmpr}`)
        const $ = cheerio.load(data);
    
        const rows = $('table > tbody > tr');

        let respuestaEnviar = []

        rows.each((index, element) => {

            const row = [];
            let p = $(element).find('td').each((i, el) => {
              row.push($(el).text().trim());
                // console.log(` ${i} ) = ${$(el).text()}`)
            });

            let vehiculo = fun.crearPersona(row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8])

            if(row.length == 9){
                respuestaEnviar.push(vehiculo)
            }

            // console.log(`Fila ${index + 1}:`, row);
        
        });

        // console.log(respuestaEnviar)
    
        res.json(respuestaEnviar)
        
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping');
    }

})

app.post("/prueba/post",async (req,res)=>{
    try {
        const formData = new FormData();

        let busqueda =  req.body.busqueda

        console.log(`Busqueda: ${busqueda}`)

        formData.append('CG_Codigo', '');
        formData.append('CG_Descri', "porvenir");
        formData.append('CG_Pais', '');

        const response = await axios.post('http://www.aduanet.gob.pe/servlet/CGEmpint', {
            CG_Codigo: "",
            CG_Descri:"porvenir",
            CG_Pais:""
            }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
        })


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

      
    
        res.json(respuestaEnviar)



    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping');
    }
})


app.listen(app.get("port"))
console.log(`server ${app.get("appName")} on port ${app.get("port")}`)