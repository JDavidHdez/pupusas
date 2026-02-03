// Array de ingredientes disponibles (puedes agregar más aquí)
const INGREDIENTES = [
    'Frijol con queso',
    'Revueltas',
    'Queso',
    'Frijol',
    'Chicharrón',
    'Loroco',
    'Ayote',
    'Espinaca con queso',
    'Camarón con queso',
    'Pollo',
    'Jalapeño',
    'Mora',
    'Queso con loroco',
    'Pupusa Loca',
    'Frijol con queso y loroco',
    'Revueltas y loroco'
];

// Estructura de datos para el pedido
let pedido = [];

// Ingredientes seleccionados temporalmente (antes de agregar al pedido)
let ingredientesTemp = {
    maiz: {},
    arroz: {}
};

// Ingrediente seleccionado actualmente en cada dropdown
let seleccionActual = {
    maiz: null,
    arroz: null
};

// Inicializar la aplicación
function init() {
    cargarPedidoDesdeLocalStorage();
    inicializarSelectores();
    actualizarVista();
}

// Inicializar los selectores con búsqueda
function inicializarSelectores() {
    ['maiz', 'arroz'].forEach(tipo => {
        const tipoCapital = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const searchInput = document.getElementById(`search${tipoCapital}`);
        const dropdown = document.getElementById(`dropdown${tipoCapital}`);

        // Renderizar todas las opciones inicialmente
        renderizarOpciones(tipo);

        // Manejar focus - mostrar dropdown
        searchInput.addEventListener('focus', () => {
            dropdown.classList.add('active');
            renderizarOpciones(tipo, searchInput.value);
        });

        // Manejar input - filtrar opciones
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            renderizarOpciones(tipo, searchTerm);
            dropdown.classList.add('active');
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
}

// Renderizar opciones del dropdown
function renderizarOpciones(tipo, filtro = '') {
    const tipoCapital = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const dropdown = document.getElementById(`dropdown${tipoCapital}`);
    
    dropdown.innerHTML = '';
    
    const ingredientesFiltrados = INGREDIENTES.filter(ing => 
        ing.toLowerCase().includes(filtro.toLowerCase())
    );

    if (ingredientesFiltrados.length === 0) {
        dropdown.innerHTML = '<div class="select-option" style="color: #999;">No se encontraron resultados</div>';
        return;
    }

    ingredientesFiltrados.forEach(ingrediente => {
        const option = document.createElement('div');
        option.className = 'select-option';
        option.textContent = ingrediente;
        option.addEventListener('click', () => {
            seleccionarIngrediente(tipo, ingrediente);
        });
        dropdown.appendChild(option);
    });
}

// Seleccionar ingrediente del dropdown
function seleccionarIngrediente(tipo, ingrediente) {
    const tipoCapital = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    const searchInput = document.getElementById(`search${tipoCapital}`);
    const dropdown = document.getElementById(`dropdown${tipoCapital}`);
    
    searchInput.value = ingrediente;
    seleccionActual[tipo] = ingrediente;
    dropdown.classList.remove('active');
}

// Agregar ingrediente desde el search
function agregarIngredienteDesdeSearch(tipo) {
    const ingrediente = seleccionActual[tipo];

    if (!ingrediente) {
        alert('Por favor selecciona un ingrediente');
        return;
    }

    if (ingredientesTemp[tipo][ingrediente]) {
        alert('Este ingrediente ya está agregado. Puedes cambiar su cantidad.');
        return;
    }

    ingredientesTemp[tipo][ingrediente] = 1;
    
    // Limpiar el input y selección
    const tipoCapital = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    document.getElementById(`search${tipoCapital}`).value = '';
    seleccionActual[tipo] = null;
    
    renderizarIngredientesTemp(tipo);
}

// Renderizar ingredientes temporales
function renderizarIngredientesTemp(tipo) {
    const container = document.getElementById(`ingredientes${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const ingredientes = ingredientesTemp[tipo];

    if (Object.keys(ingredientes).length === 0) {
        container.innerHTML = '<div class="empty-ingredients">No hay ingredientes agregados</div>';
        return;
    }

    container.innerHTML = '';
    Object.entries(ingredientes).forEach(([ingrediente, cantidad]) => {
        const item = document.createElement('div');
        item.className = 'ingrediente-item';
        item.innerHTML = `
            <span>${ingrediente}</span>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="cambiarCantidadTemp('${tipo}', '${ingrediente}', -1)">−</button>
                <input type="number" min="1" value="${cantidad}" 
                        onchange="actualizarCantidadTemp('${tipo}', '${ingrediente}', this.value)"
                        onclick="this.select()">
                <button class="quantity-btn" onclick="cambiarCantidadTemp('${tipo}', '${ingrediente}', 1)">+</button>
                <button class="remove-ingrediente" onclick="eliminarIngredienteTemp('${tipo}', '${ingrediente}')" title="Eliminar">×</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Cambiar cantidad con botones
function cambiarCantidadTemp(tipo, ingrediente, cambio) {
    const nuevaCantidad = ingredientesTemp[tipo][ingrediente] + cambio;
    if (nuevaCantidad >= 1) {
        ingredientesTemp[tipo][ingrediente] = nuevaCantidad;
        renderizarIngredientesTemp(tipo);
    }
}

// Actualizar cantidad desde el input
function actualizarCantidadTemp(tipo, ingrediente, valor) {
    const cantidad = parseInt(valor);
    if (cantidad >= 1) {
        ingredientesTemp[tipo][ingrediente] = cantidad;
    } else {
        ingredientesTemp[tipo][ingrediente] = 1;
    }
    renderizarIngredientesTemp(tipo);
}

// Eliminar ingrediente temporal
function eliminarIngredienteTemp(tipo, ingrediente) {
    delete ingredientesTemp[tipo][ingrediente];
    renderizarIngredientesTemp(tipo);
}

// Agregar participante al pedido
function agregarParticipante() {
    const nombre = document.getElementById('nombreParticipante').value.trim();
    
    if (!nombre) {
        alert('Por favor ingresa un nombre para el participante');
        return;
    }

    const pupusasMaiz = {...ingredientesTemp.maiz};
    const pupusasArroz = {...ingredientesTemp.arroz};

    // Verificar que haya al menos una pupusa
    if (Object.keys(pupusasMaiz).length === 0 && Object.keys(pupusasArroz).length === 0) {
        alert('Por favor selecciona al menos una pupusa');
        return;
    }

    // Agregar al pedido
    pedido.push({
        nombre: nombre,
        maiz: pupusasMaiz,
        arroz: pupusasArroz
    });

    // Guardar en localStorage
    guardarPedidoEnLocalStorage();

    // Limpiar formulario y actualizar vista
    limpiarFormulario();
    actualizarVista();
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('nombreParticipante').value = '';
    ingredientesTemp = {
        maiz: {},
        arroz: {}
    };
    seleccionActual = {
        maiz: null,
        arroz: null
    };
    document.getElementById('searchMaiz').value = '';
    document.getElementById('searchArroz').value = '';
    renderizarIngredientesTemp('maiz');
    renderizarIngredientesTemp('arroz');
}

// Eliminar participante
function eliminarParticipante(index) {
    if (confirm(`¿Estás seguro de eliminar a ${pedido[index].nombre} del pedido?`)) {
        pedido.splice(index, 1);
        guardarPedidoEnLocalStorage();
        actualizarVista();
    }
}

// Limpiar todo el pedido
function limpiarTodo() {
    if (pedido.length === 0) {
        alert('No hay ningún pedido para limpiar');
        return;
    }

    if (confirm('¿Estás seguro de limpiar todo el pedido? Esta acción no se puede deshacer.')) {
        pedido = [];
        guardarPedidoEnLocalStorage();
        actualizarVista();
    }
}

// Actualizar la vista completa
function actualizarVista() {
    actualizarListaParticipantes();
    actualizarResumen();
}

// Actualizar lista de participantes
function actualizarListaParticipantes() {
    const container = document.getElementById('listaParticipantes');
    
    if (pedido.length === 0) {
        container.innerHTML = '<div class="empty-message">No hay participantes aún. ¡Agrega el primero!</div>';
        return;
    }

    container.innerHTML = '';
    pedido.forEach((participante, index) => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        
        let detalleMaiz = '';
        if (Object.keys(participante.maiz).length > 0) {
            const items = Object.entries(participante.maiz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalleMaiz = `<strong>Maíz:</strong> ${items}`;
        }

        let detalleArroz = '';
        if (Object.keys(participante.arroz).length > 0) {
            const items = Object.entries(participante.arroz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalleArroz = `<strong>Arroz:</strong> ${items}`;
        }

        const separador = detalleMaiz && detalleArroz ? '<br>' : '';

        card.innerHTML = `
            <div class="participant-header">
                <span class="participant-name">👤 ${participante.nombre}</span>
                <button class="delete-btn" onclick="eliminarParticipante(${index})">Eliminar</button>
            </div>
            <div class="participant-details">
                ${detalleMaiz}${separador}${detalleArroz}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Generar texto del resumen para copiar
function generarTextoResumen() {
    if (pedido.length === 0) {
        return 'No hay pedidos registrados';
    }

    let texto = '═══════════════════════════════\n';
    texto += '🫓 RESUMEN DEL PEDIDO DE PUPUSAS 🫓\n';
    texto += '═══════════════════════════════\n\n';

    // Individuales
    texto += '👥 INDIVIDUALES:\n';
    texto += '─────────────────────────────\n';
    
    pedido.forEach(participante => {
        let detalle = [];
        
        if (Object.keys(participante.maiz).length > 0) {
            const items = Object.entries(participante.maiz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalle.push(`Maíz: ${items}`);
        }
        
        if (Object.keys(participante.arroz).length > 0) {
            const items = Object.entries(participante.arroz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalle.push(`Arroz: ${items}`);
        }

        const detalleTexto = detalle.length > 0 ? detalle.join('; ') : 'Sin pedido';
        texto += `${participante.nombre} → ${detalleTexto}\n`;
    });

    // Calcular totales
    const totalesMaiz = {};
    const totalesArroz = {};
    
    pedido.forEach(participante => {
        Object.entries(participante.maiz).forEach(([ing, cant]) => {
            totalesMaiz[ing] = (totalesMaiz[ing] || 0) + cant;
        });
        
        Object.entries(participante.arroz).forEach(([ing, cant]) => {
            totalesArroz[ing] = (totalesArroz[ing] || 0) + cant;
        });
    });

    // Totales
    texto += '\n📊 TOTALES:\n';
    texto += '─────────────────────────────\n';
    
    if (Object.keys(totalesMaiz).length > 0) {
        const itemsMaiz = Object.entries(totalesMaiz)
            .map(([ing, cant]) => `${cant} ${ing}`)
            .join(', ');
        texto += `Pupusas de Maíz → ${itemsMaiz}\n`;
    }
    
    if (Object.keys(totalesArroz).length > 0) {
        const itemsArroz = Object.entries(totalesArroz)
            .map(([ing, cant]) => `${cant} ${ing}`)
            .join(', ');
        texto += `Pupusas de Arroz → ${itemsArroz}\n`;
    }

    // Total de pupusas
    const totalPupusas = Object.values(totalesMaiz).reduce((a, b) => a + b, 0) + 
                        Object.values(totalesArroz).reduce((a, b) => a + b, 0);
    
    texto += '\n═══════════════════════════════\n';
    texto += `🫓 TOTAL → ${totalPupusas} pupusas\n`;
    texto += '═══════════════════════════════';

    return texto;
}

// Copiar resumen al portapapeles
async function copiarResumen() {
    const texto = generarTextoResumen();
    
    try {
        await navigator.clipboard.writeText(texto);
        
        // Cambiar el botón temporalmente para mostrar feedback
        const btn = document.getElementById('btnCopiar');
        const textoOriginal = btn.innerHTML;
        btn.innerHTML = '✓ ¡Copiado!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerHTML = textoOriginal;
            btn.classList.remove('copied');
        }, 2000);
        
    } catch (err) {
        alert('No se pudo copiar al portapapeles. Por favor, selecciona y copia manualmente.');
        console.error('Error al copiar:', err);
    }
}

// Actualizar resumen del pedido
function actualizarResumen() {
    const container = document.getElementById('resumenPedido');
    
    if (pedido.length === 0) {
        container.innerHTML = '<div class="empty-message">El resumen aparecerá cuando agregues participantes al pedido</div>';
        return;
    }

    let html = '';

    // Sección Individual
    html += '<div class="resumen-section">';
    html += '<h3>👥 Individuales</h3>';
    
    pedido.forEach(participante => {
        let detalle = [];
        
        if (Object.keys(participante.maiz).length > 0) {
            const items = Object.entries(participante.maiz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalle.push(`Maíz: ${items}`);
        }
        
        if (Object.keys(participante.arroz).length > 0) {
            const items = Object.entries(participante.arroz)
                .map(([ing, cant]) => `${cant} ${ing}`)
                .join(', ');
            detalle.push(`Arroz: ${items}`);
        }

        const detalleTexto = detalle.length > 0 ? detalle.join('; ') : 'Sin pedido';
        html += `<div class="resumen-item"><strong>${participante.nombre}</strong> → ${detalleTexto}</div>`;
    });
    
    html += '</div>';

    // Calcular totales
    const totalesMaiz = {};
    const totalesArroz = {};
    
    pedido.forEach(participante => {
        Object.entries(participante.maiz).forEach(([ing, cant]) => {
            totalesMaiz[ing] = (totalesMaiz[ing] || 0) + cant;
        });
        
        Object.entries(participante.arroz).forEach(([ing, cant]) => {
            totalesArroz[ing] = (totalesArroz[ing] || 0) + cant;
        });
    });

    // Sección Totales
    html += '<div class="resumen-section">';
    html += '<h3>📊 Totales</h3>';
    
    if (Object.keys(totalesMaiz).length > 0) {
        const itemsMaiz = Object.entries(totalesMaiz)
            .map(([ing, cant]) => `${cant} ${ing}`)
            .join(', ');
        html += `<div class="resumen-item"><strong>Pupusas de Maíz</strong> → ${itemsMaiz}</div>`;
    }
    
    if (Object.keys(totalesArroz).length > 0) {
        const itemsArroz = Object.entries(totalesArroz)
            .map(([ing, cant]) => `${cant} ${ing}`)
            .join(', ');
        html += `<div class="resumen-item"><strong>Pupusas de Arroz</strong> → ${itemsArroz}</div>`;
    }
    
    html += '</div>';

    // Total de pupusas
    const totalPupusas = Object.values(totalesMaiz).reduce((a, b) => a + b, 0) + 
                        Object.values(totalesArroz).reduce((a, b) => a + b, 0);
    
    html += `<div class="total-final">🫓 Total → ${totalPupusas} pupusas</div>`;

    // Botón para copiar
    html += `
        <div style="text-align: center;">
            <button class="copy-btn" id="btnCopiar" onclick="copiarResumen()">
                📋 Copiar Resumen al Portapapeles
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// Guardar en localStorage
function guardarPedidoEnLocalStorage() {
    localStorage.setItem('pedidoPupusas', JSON.stringify(pedido));
}

// Cargar desde localStorage
function cargarPedidoDesdeLocalStorage() {
    const guardado = localStorage.getItem('pedidoPupusas');
    if (guardado) {
        pedido = JSON.parse(guardado);
    }
}

// Inicializar cuando cargue la página
window.onload = init;