

let normalizacionCodEmpresa = (codBasico) =>{
    
    let rpt;
    switch(codBasico.length){
        case 1:
            rpt = "000"+codBasico
            break;
        case 2:
            rpt = "00"+codBasico
            break;
        case 3:
            rpt = "0"+codBasico
            break;
        case 4:
            rpt = codBasico
            break;
        default:
            rpt = codBasico
            break;
    }
    return rpt
}

let crearPersona = (placa, marca,chasis,fabric,capacidad,tipoConv,resol,nroResol,estado)=>{
    const rpt = {
        placa: placa,
        marca: marca,
        chasis: chasis,
        fabric: fabric,
        capacidad: capacidad,
        tipoConv: tipoConv,
        resol: resol,
        nroResol: nroResol,
        estado: estado
    }

    return rpt
}

let crearEmpresa = (codigo, descripcion,jurisdiccion,tipoDeConvenio,direccion,estado)=>{
    const rpt = {
        codigo: codigo,
        descripcion: descripcion,
        jurisdiccion: jurisdiccion,
        tipoDeConvenio: tipoDeConvenio,
        direccion: direccion,
        estado: estado
    }

    return rpt
}





module.exports = { normalizacionCodEmpresa, crearPersona,crearEmpresa};