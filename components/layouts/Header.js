import Buscar from '../ui/Buscar';
import Navegacion from './Navegacion';
import Link from 'next/link';

const Header = () => {
    return ( 
        <header>
            <div>
                <div>
                    <p>P</p>

                    <Buscar />


                    <Navegacion />
                </div>

                <div>
                    <p>Hola: Yisebell</p>
                    <button type="button">Cerrar sesión</button>
                    <Link href="/">Login</Link>
                    <Link href="/">Crear cuenta</Link>
                </div>
            </div>
        </header>
    );
}

export default Header;