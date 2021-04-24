import React, { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';
import { FirebaseContext } from '../../firebase';
import Layout from '../../components/layouts/Layout';
import Error404 from '../../components/layouts/404';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Campo, InputSubmit } from '../../components/ui/Formulario';
import Boton from '../../components/ui/Boton';

const ContenedorProducto = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 2rem;
`;

const Imagen = styled.img`
    max-width: 100%;
`;

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #da552f;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`;

const Producto = () => {

    // state del componente
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);
    const [comentario, guardarComentario] = useState({});
    const [consultarBD, guardarConsultarBD] = useState(true);

    // Router para obtener el id actual
    const router = useRouter();
    const {query : {id}} = router;

    // context del firebase
    const { firebase, usuario } = useContext(FirebaseContext);

    useEffect(() => {
        if(id && consultarBD) {
            const obtenerProducto = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();
                if(producto.exists) {
                    guardarProducto(producto.data());
                } else {
                    guardarError(true);
                }
                guardarConsultarBD(false);
            }
            obtenerProducto();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if(Object.keys(producto).length === 0 && !error) return 'Cargando...';

    const { comentarios, creado, descripcion, empresa, nombre, url, urlimagen, votos, creador, haVotado} = producto;

    // Administrar y validar los votos
    const votarProducto = () => {
        if(!usuario) {
            return router.push('/login');
        }

        // Obtener y sumar nuevo voto
        const nuevoTotal = votos + 1;

        // Verificar si el usuario actual ha votado
        if(haVotado.includes(usuario.uid)) return;

        // Guardar el ID del usuario que ha votado
        const nuevoHaVotado = [...haVotado, usuario.uid];

        // Actualizar en la BBDD
        firebase.db.collection('productos').doc(id).update({
            votos: nuevoTotal,
            haVotado: nuevoHaVotado
        });

        // Actualizar el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal
        });

        guardarConsultarBD(true); // hay un voto entonces consultar BD
    };

    // Funciones para crear comentarios
    const comentarioChange = e => {
        guardarComentario({
            ...comentario,
            [e.target.name]: e.target.value
        });
    };

    // identifica si el comentario es del creador del producto
    const esCreador = id => {
        if(creador.id === id) {
            return true;
        }
    };

    const agregarComentario = e => {
        e.preventDefault();
        if(!usuario) {
            return router.push('/login');
        }

        // Información extra al comentario
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        // Tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [...comentarios, comentario];

        // Actualizar la BBDD
        firebase.db.collection('productos').doc(id).update({
            comentarios: nuevosComentarios
        });

        // Actualizar el state
        guardarProducto({
            ...producto,
            comentarios: nuevosComentarios
        });

        guardarConsultarBD(true); // hay un comentario entonces consultar BD
    };

    // funcion que revisa que el creador del producto es el mismo que está autenticado
    const puedeBorrar = () => {
        if(!usuario) return false;

        if(creador.id === usuario.uid) {
            return true;
        }
    };

    // elimina un producto de la BD
    const eliminarProducto = async () => {

        if(!usuario) {
            return router.push('/login');
        }

        if(creador.id !== usuario.uid) {
            return router.push('/');
        }

        try {
            await firebase.db.collection('productos').doc(id).delete();
            router.push('/');
        } catch (error) {
            console.log(error);
        }
    }

    return ( 
        <Layout>
            {error ? <Error404 /> : (
                <div className="contenedor">
                    <h1
                        css={css`
                            text-align: center;
                            margin-top: 5rem;
                        `}
                    >{nombre}</h1>

                    <ContenedorProducto>
                        <div>
                            <p>publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                            <p>Por: {creador.nombre} - {empresa}</p>
                            <div
                                css={css`
                                    display: flex;
                                    text-align: center;
                                    justify-content: center;
                                `}
                            >
                                <Imagen src={urlimagen} />
                            </div>
                            <p>{descripcion}</p>

                            {usuario && (
                                <>
                                <h2>Agrega tu comentario</h2>
                                <form
                                    onSubmit={agregarComentario}
                                >
                                    <Campo>
                                        <input 
                                            type="text"
                                            name="mensaje"
                                            onChange={comentarioChange}
                                        />
                                    </Campo>
                                    <InputSubmit 
                                        type="submit"
                                        value="Agregar comentario"
                                    />
                                </form>
                                </>
                            )}

                            <h2
                                css={css`
                                    margin: 2rem 0;
                                `}
                            >Comentarios</h2>
                            
                            {comentarios.length === 0 ? 'Aun no hay comentarios!' : (
                                <ul>
                                {comentarios.map((comentario, i) => (
                                    <li
                                        key={`${comentario.usuarioId}-${i}`}
                                        css={css`
                                            border: 1px solid #e1e1e1;
                                            padding: 2rem;
                                        `}
                                    >
                                        <p>{comentario.mensaje}</p>
                                        <p>Escrito por: 
                                            <span
                                                css={css`
                                                    font-weight: bold;
                                                `}
                                            >
                                            {' '}{comentario.usuarioNombre}
                                            </span>
                                        </p>
                                        {esCreador(comentario.usuarioId) && <CreadorProducto>Creador</CreadorProducto>}
                                    </li>
                                ))}
                            </ul>  
                            )}                                              
                        </div>

                        <aside>
                            <Boton
                                target="_blank"
                                bgColor="true"
                                href={url}
                            >Visitar URL</Boton>

                            <div
                                css={css`
                                    margin-top: 5rem;
                                `}
                            >
                                <p
                                    css={css`
                                        text-align: center;
                                    `}
                                >{votos} Votos</p>

                                {usuario && (
                                    <Boton
                                        onClick={votarProducto}
                                    >
                                        Votar
                                    </Boton>
                                )}                            
                            </div>
                            
                        </aside>
                    </ContenedorProducto>

                    {puedeBorrar() &&
                        <Boton
                            onClick={eliminarProducto}
                        >Eliminar producto</Boton>
                    }
                </div>
                )}
        </Layout>
    );
}

export default Producto;