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

// Estructuras de datos principales recuperadas de memoria
let datosMios = JSON.parse(localStorage.getItem('datosMios')) || [];
let datosAmiga = JSON.parse(localStorage.getItem('datosAmiga')) || [];

// Variables auxiliares para saber a qué bloque adjuntar la foto subida
let perfilDestinoActivo = '';
let idBloqueActivo = null;

// Inicializar la pantalla con los datos históricos guardados
actualizarPantalla();

// Evento para añadir un día tuyo
btnMio.addEventListener('click', () => {
    agregarDia('mio');
});

// Evento para añadir un día de tu amiga
btnAmiga.addEventListener('click', () => {
    agregarDia('amiga');
});

// Función central para registrar un nuevo día en el arreglo
function agregarDia(perfil) {
    const lista = perfil === 'mio' ? datosMios : datosAmiga;
    const nuevoNumeroDia = lista.length + 1;
    
    // Obtener la fecha del día actual
    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Crear el nuevo registro del día
    const nuevoRegistro = {
        id: Date.now() + Math.random(), // Genera un ID único preciso
        numeroDia: nuevoNumeroDia,
        fecha: fechaFormateada,
        frase: frases[Math.floor(Math.random() * frases.length)],
        foto: "" // Vacío hasta que decidan subir la imagen de este día
    };

    lista.unshift(nuevoRegistro); // Coloca el día más reciente arriba del todo
    guardarYActualizar();
}

// Función encargada de dibujar los bloques del historial en el HTML
function renderizarHistorial(lista, contenedor, perfil) {
    contenedor.innerHTML = ''; // Limpiar el área antes de redibujar

    if (lista.length === 0) {
        contenedor.innerHTML = '<p style="color: #6c757d; font-size: 0.9rem; font-style: italic;">No hay días registrados aún.</p>';
        return;
    }

    lista.forEach(item => {
        const bloque = document.createElement('div');
        bloque.className = 'bloque-dia';

        // Estructura de texto del bloque
        let contenidoHtml = `
            <div class="meta-dia">
                <span>Día #${item.numeroDia}</span>
                <span>📅 ${item.fecha}</span>
            </div>
            <div class="frase-dia">${item.frase}</div>
            <div class="contenedor-foto-bloque">
        `;

        // Si ya tiene foto asociada, la muestra. Si no, muestra el botón para subirla.
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

// Conectar el botón oculto del sistema con el clic del bloque específico
window.activarSubidaFoto = function(perfil, id) {
    perfilDestinoActivo = perfil;
    idBloqueActivo = id;
    inputFotoGlobal.click(); // Abre el explorador de archivos del dispositivo
};

// Escuchar cuando el usuario selecciona un archivo de imagen
inputFotoGlobal.addEventListener('change', () => {
    const archivo = inputFotoGlobal.files[0];
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function (e) {
            const lista = perfilDestinoActivo === 'mio' ? datosMios : datosAmiga;
            // Buscar el día específico por su ID único para inyectarle la foto en Base64
            const registro = lista.find(item => item.id === idBloqueActivo);
            if (registro) {
                registro.foto = e.target.result;
                guardarYActualizar();
            }
            inputFotoGlobal.value = ''; // Limpiar el input para permitir cargas consecutivas
        };
        lector.readAsDataURL(archivo);
    }
});

// Guardar los arreglos en el almacenamiento del navegador y redibujar la interfaz
function guardarYActualizar() {
    localStorage.setItem('datosMios', JSON.stringify(datosMios));
    localStorage.setItem('datosAmiga', JSON.stringify(datosAmiga));
    actualizarPantalla();
}

function actualizarPantalla() {
    contadorMio.textContent = datosMios.length;
    contadorAmiga.textContent = datosAmiga.length;

    renderizarHistorial(datosMios, historialMioContenedor, 'mio');
    renderizarHistorial(datosAmiga, historialAmigaContenedor, 'amiga');
}

// Limpiar la memoria del navegador por completo
btnReiniciar.addEventListener('click', () => {
    if (confirm('¿Estás segura de borrar por completo todo tu historial y el de tu amiga?')) {
        localStorage.clear();
        datosMios = [];
        datosAmiga = [];
        guardarYActualizar();
    }
});