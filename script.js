// IMPORTACIÓN MODERNA DE FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuración corregida y enlazada a tu proyecto
const firebaseConfig = {
    apiKey: "AIzaSyAaTZ9-b6tzpcSDCNZywFST9H8NpKWE24s",
    authDomain: "ejercicio-compartido.firebaseapp.com",
    databaseURL: "https://ejercicio-compartido-default-rtdb.firebaseio.com",
    projectId: "ejercicio-compartido",
    storageBucket: "ejercicio-compartido.firebasestorage.app",
    messagingSenderId: "717200775816",
    appId: "1:717200775816:web:1cff0ba6858c3bf0094d3"
};

// Inicializar servicios modulares de Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Banco único de frases motivacionales
const frases = [
    "¡Excelente trabajo! Cada gota de sudor te acerca a tu meta. 🏃‍♀️✨",
    "¡Espectacular! Tu cuerpo del futuro te lo agradecerá. 🙌",
    "¡No te detengas! Disciplina es hacer lo que debes. 🔥",
    "¡Qué nivel! Derrotaste a la pereza un día más. 👑",
    "¡Fuerza pura! Pequeños pasos crean resultados gigantescos. ⚡",
    "¡Brutal! Oficialmente más fuerte que ayer. 💪🌟",
    "¡Constancia ganadora! Lo estás haciendo increíble. 🎯"
];

// Elementos del DOM
const contadorMio = document.getElementById('contador-mio');
const btnMio = document.getElementById('btn-mio');
const historialMioContenedor = document.getElementById('historial-mio');

const contadorAmiga = document.getElementById('contador-amiga');
const btnAmiga = document.getElementById('btn-amiga');
const historialAmigaContenedor = document.getElementById('historial-amiga');

const inputFotoGlobal = document.getElementById('input-foto-global');
const btnReiniciar = document.getElementById('btn-reiniciar');

// Estructuras de datos principales en tiempo real
let datosMios = [];
let datosAmiga = [];

// Variables auxiliares para la gestión de evidencias fotográficas
let perfilDestinoActivo = '';
let idBloqueActivo = null;

// ESCUCHAR CAMBIOS EN TIEMPO REAL DESDE FIREBASE
onValue(ref(db, 'progreso/mio'), (snapshot) => {
    datosMios = snapshot.val() || [];
    actualizarPantalla();
});

onValue(ref(db, 'progreso/amiga'), (snapshot) => {
    datosAmiga = snapshot.val() || [];
    actualizarPantalla();
});

// Eventos de botones para sumar días
btnMio.addEventListener('click', () => { agregarDia('mio'); });
btnAmiga.addEventListener('click', () => { agregarDia('amiga'); });

function agregarDia(perfil) {
    const lista = perfil === 'mio' ? datosMios : datosAmiga;
    const nuevoNumeroDia = lista.length + 1;
    
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const nuevoRegistro = {
        id: Date.now() + Math.random(),
        numeroDia: nuevoNumeroDia,
        fecha: fechaFormateada,
        frase: frases[Math.floor(Math.random() * frases.length)],
        foto: "" 
    };

    lista.unshift(nuevoRegistro); 
    set(ref(db, 'progreso/' + perfil), lista);
}

function renderizarHistorial(lista, contenedor, perfil) {
    contenedor.innerHTML = '';
    if (lista.length === 0) {
        contenedor.innerHTML = '<p style="color: #6c757d; font-size: 0.9rem; font-style: italic;">No hay días registrados aún.</p>';
        return;
    }

    lista.forEach(item => {
        const bloque = document.createElement('div');
        bloque.className = 'bloque-dia';

        let contenidoHtml = `
            <div class="meta-dia">
                <span>Día #${item.numeroDia}</span>
                <span>📅 ${item.fecha}</span>
            </div>
            <div class="frase-dia">${item.frase}</div>
            <div class="contenedor-foto-bloque">
        `;

        if (item.foto) {
            contenidoHtml += `<img src="${item.foto}" class="img-historial" alt="Evidencia">`;
        } else {
            contenidoHtml += `<button class="btn-subir-bloque" onclick="activarSubidaFoto('${perfil}', ${item.id})">📷 Añadir Foto</button>`;
        }

        contenidoHtml += `</div>`;
        bloque.innerHTML = contenidoHtml;
        contenedor.appendChild(bloque);
    });
}

window.activarSubidaFoto = function(perfil, id) {
    perfilDestinoActivo = perfil;
    idBloqueActivo = id;
    inputFotoGlobal.click();
};

inputFotoGlobal.addEventListener('change', () => {
    const archivo = inputFotoGlobal.files[0];
    if (archivo) {
        if (archivo.size > 1024 * 1024) { 
            alert("La foto es muy pesada. Intenta con una imagen de menor resolución o una captura de pantalla.");
            return;
        }

        const lector = new FileReader();
        lector.onload = function (e) {
            const perfil = perfilDestinoActivo;
            const lista = perfil === 'mio' ? datosMios : datosAmiga;
            const registro = lista.find(item => item.id === idBloqueActivo);
            
            if (registro) {
                registro.foto = e.target.result;
                set(ref(db, 'progreso/' + perfil), lista);
            }
            inputFotoGlobal.value = '';
        };
        lector.readAsDataURL(archivo);
    }
});

function actualizarPantalla() {
    contadorMio.textContent = datosMios.length;
    contadorAmiga.textContent = datosAmiga.length;

    renderizarHistorial(datosMios, historialMioContenedor, 'mio');
    renderizarHistorial(datosAmiga, historialAmigaContenedor, 'amiga');
}

// Botón de reinicio global modular para la base de datos
btnReiniciar.addEventListener('click', () => {
    if (confirm('¿Estás segura de borrar por completo TODO el historial en la nube de ambas?')) {
        remove(ref(db, 'progreso')).then(() => {
            location.reload();
        });
    }
});