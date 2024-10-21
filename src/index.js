const express = require("express");
const axios = require("axios");
const cheerio = require('cheerio');
const cors = require('cors');


const fun = require("./funciones")
const funAv = require("./funcionesAvanzadas") 

const FormData = require('form-data');

const app = express()
app.use(cors());


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

        });
    
        res.json(respuestaEnviar)
        
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping en /prueba/:codEmpresa');
    }

})

app.post("/DescriPlaca/post",async (req,res,next) => {
    try {
        
        let descriEmpresa =  req.body.descriEmpresa
        let placa = req.body.placa
    
        if(placa && descriEmpresa){
            
            // console.log("antes del funAv.obtenerEmpresasXDescri")
            let rptListaEmpres = await funAv.obtenerEmpresasXDescri(descriEmpresa)
            // console.log(`despues obtenerEmpresasXDescri con ${rptListaEmpres}` )
            // console.log("luego")

            // console.log(`Obtenido rpt empresas ${rptListaEmpres}`)

            if(rptListaEmpres.comentario == "OK"){

                // console.log("si est OK 1")

                let listaEmpresas = rptListaEmpres.rpt

                let listaCoincidentes = []

                for (const element of listaEmpresas) {
                    
                    // console.log("si esta dentro de Foreach")
    
                    let codEmpresa = element.codigo
    
    
                    // console.log(" antes del nuevo obte")
                    let vehiculoCoincide = await funAv.obtenerPlacaYcodEmpresa(placa,codEmpresa)
                    // console.log(" despues del nuevo obte")
    
    
                    if (vehiculoCoincide.comentario == "OK") {
                        listaCoincidentes.push(vehiculoCoincide.rpt)
    
                        if (vehiculoCoincide.rpt.estado == "HABILITADO") {
                            
                            res.json({
                                comentario:"OK",
                                rpt: listaCoincidentes
    
                            })
                            return ""
                        }
                    }
                }


                // listaEmpresas.forEach(async element => {

                // });

                res.json({
                    comentario:"OK",
                    rpt: listaCoincidentes
                })

            }else{
                res.status(500).json({
                    comentario:"erro al buscar Empresa",
                    rpt : []
                })
            }

    
        }else{
            // res.status(500).send('Error placa o empresa NO ingresados en /DescriPlaca/post');
            res.status(500).json({
                comentario:"Error placa o empresa NO ingresados en /DescriPlaca/post",
                rpt : []
            })

            return ""
            console.log("finish")

        }
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping en /DescriPlaca/post');
    }
})

app.post("/PlacaEmpresa/post",async (req,res) => {
    try {

        let preCodigoEmpr =  req.body.empresa

        let placa = req.body.placa
        let codigoEmpr = fun.normalizacionCodEmpresa(preCodigoEmpr)
    
        let respuesta = await funAv.obtenerPlacaYcodEmpresa(placa,codigoEmpr)

        res.send(respuesta)

        
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping en /PlacaEmpresa/post');
    }
})


app.post("/prueba/post",async (req,res)=>{
    try {

        let busqueda =  req.body.busqueda

        rpt = await funAv.obtenerEmpresasXDescri(busqueda)
    
        if (rpt.comentario == "OK") {
            
            res.json(rpt.rpt)
        } else {
            res.status(500).send(`${rpt.comentario}`);
        }


    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Error al hacer scraping en /prueba/post');
    }
})


app.listen(app.get("port"))
console.log(`server ${app.get("appName")} on port ${app.get("port")}`)