export default function validarCrearCuenta(valores) {
    
    let errores = {};

    // Validar el nombre del usuario
    if(!valores.nombre) {
        errores.nombre = 'El Nombre es obligatorio';
    }

    // Validar el email del usuario
    if(!valores.email) {
        errores.email = 'El Email es obligatorio';
    } else if( !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(valores.email) ) {
        errores.email = 'El Email no es válido';
    }

    // Validar el password del usuario
    if(!valores.password) {
        errores.password = 'El password es obligatorio';
    } else if(valores.password.length < 6) {
        errores.password = 'El password debe tener por lo menos 6 caracteres';
    }

    return errores;
};