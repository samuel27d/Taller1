/**
 * QuickOrder - Gestión del Carrito de Compras, Menú Digital y Kiosco de Confirmación
 * Arquitectura modular con persistencia en localStorage y Modal tipo Kiosco Digital
 */

// Clave para almacenamiento persistente
const STORAGE_KEY = 'quickorder_pedido_carrito';

// Arreglo en memoria del pedido
let pedido = [];

// Elementos DOM Principales del Carrito
const btnAbrirCarrito = document.getElementById('btn-abrir-carrito');
const btnCerrarCarrito = document.getElementById('btn-cerrar-carrito');
const carritoPanel = document.getElementById('carrito-panel');
const carritoOverlay = document.getElementById('carrito-overlay');
const carritoCuerpo = document.getElementById('carrito-cuerpo');
const carritoSubtotalMonto = document.getElementById('carrito-subtotal-monto');
const carritoTotalMonto = document.getElementById('carrito-total-monto');
const carritoBadgeItems = document.getElementById('carrito-badge-items');
const badgeContadorHeader = document.getElementById('badge-contador-header');
const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
const btnFinalizarPedido = document.getElementById('btn-finalizar-pedido');

/**
 * Formatear números a moneda colombiana (COP)
 */
function formatearPrecio(valor) {
    return '$ ' + Number(valor).toLocaleString('es-CO');
}

/**
 * Formatear fecha y hora actual para el recibo
 */
function obtenerFechaHoraActual() {
    const ahora = new Date();
    const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
    const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${ahora.toLocaleDateString('es-CO', opcionesFecha)} – ${ahora.toLocaleTimeString('es-CO', opcionesHora)}`;
}

/**
 * Generar número de orden aleatorio tipo McDonald's (Ej: #QO-528)
 */
function generarNumeroOrden() {
    const numero = Math.floor(100 + Math.random() * 900);
    return `#QO-${numero}`;
}

/**
 * Cargar el pedido guardado en LocalStorage
 */
function cargarPedido() {
    try {
        const datosGuardados = localStorage.getItem(STORAGE_KEY);
        if (datosGuardados) {
            pedido = JSON.parse(datosGuardados);
        } else {
            pedido = [];
        }
    } catch (error) {
        console.error('Error al cargar pedido desde localStorage:', error);
        pedido = [];
    }
}

/**
 * Guardar el estado actual en LocalStorage y refrescar interfaz
 */
function guardarPedido() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pedido));
    } catch (error) {
        console.error('Error al guardar pedido en localStorage:', error);
    }
    actualizarInterfaz();
}

/**
 * Abrir panel lateral del carrito
 */
function abrirCarrito() {
    if (carritoPanel && carritoOverlay) {
        carritoPanel.classList.add('activo');
        carritoOverlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cerrar panel lateral del carrito
 */
function cerrarCarrito() {
    if (carritoPanel && carritoOverlay) {
        carritoPanel.classList.remove('activo');
        carritoOverlay.classList.remove('activo');
        document.body.style.overflow = '';
    }
}

/**
 * Agregar un producto al carrito
 */
function agregarProducto(nombre, precio) {
    if (!nombre || isNaN(precio)) return;

    const productoExistente = pedido.find(item => item.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        pedido.push({
            nombre: nombre,
            precio: Number(precio),
            cantidad: 1
        });
    }

    guardarPedido();

    // Animación de pulso en el badge del encabezado
    if (badgeContadorHeader) {
        badgeContadorHeader.classList.add('animar');
        setTimeout(() => badgeContadorHeader.classList.remove('animar'), 300);
    }
}

/**
 * Modificar la cantidad de un producto (+1 o -1)
 */
function cambiarCantidad(nombre, delta) {
    const item = pedido.find(p => p.nombre === nombre);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        pedido = pedido.filter(p => p.nombre !== nombre);
    }

    guardarPedido();
}

/**
 * Eliminar un producto completo del carrito
 */
function eliminarProducto(nombre) {
    pedido = pedido.filter(p => p.nombre !== nombre);
    guardarPedido();
}

/**
 * Vaciar todos los productos del carrito
 */
function vaciarCarrito() {
    if (pedido.length === 0) return;
    pedido = [];
    guardarPedido();
}

/**
 * Renderizar la interfaz visual del carrito y contadores
 */
function actualizarInterfaz() {
    const totalItems = pedido.reduce((acc, item) => acc + item.cantidad, 0);
    const totalMonto = pedido.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // Actualizar contadores
    if (badgeContadorHeader) badgeContadorHeader.textContent = totalItems;
    if (carritoBadgeItems) carritoBadgeItems.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
    if (carritoSubtotalMonto) carritoSubtotalMonto.textContent = formatearPrecio(totalMonto);
    if (carritoTotalMonto) carritoTotalMonto.textContent = formatearPrecio(totalMonto);

    // Actualizar listado de productos en el drawer
    if (!carritoCuerpo) return;

    if (pedido.length === 0) {
        carritoCuerpo.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icono">
                    <svg viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                </div>
                <p class="carrito-vacio-texto">Tu carrito está vacío</p>
                <p class="carrito-vacio-subtexto">Explora nuestro menú y añade tus platos favoritos</p>
            </div>
        `;
        if (btnFinalizarPedido) btnFinalizarPedido.disabled = true;
    } else {
        if (btnFinalizarPedido) btnFinalizarPedido.disabled = false;
        carritoCuerpo.innerHTML = pedido.map(item => `
            <div class="carrito-item">
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">${formatearPrecio(item.precio)} c/u</div>
                    <div class="carrito-item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</div>
                </div>
                <div class="carrito-item-controles">
                    <button class="btn-control-cantidad" data-accion="decrementar" data-nombre="${item.nombre}" aria-label="Restar uno">-</button>
                    <span class="carrito-item-cantidad">${item.cantidad}</span>
                    <button class="btn-control-cantidad" data-accion="incrementar" data-nombre="${item.nombre}" aria-label="Sumar uno">+</button>
                    <button class="btn-eliminar-item" data-accion="eliminar" data-nombre="${item.nombre}" aria-label="Eliminar producto">
                        <svg viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

/**
 * ==========================================================================
 * MODAL DE CONFIRMACIÓN ELEGANTE (TIPO RECIBO / KIOSCO DIGITAL)
 * ==========================================================================
 */

/**
 * Crear o verificar la existencia del modal de confirmación en el DOM
 */
function asegurarModalEnDOM() {
    let modalOverlay = document.getElementById('modal-confirmacion-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-confirmacion-overlay';
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-ticket" role="dialog" aria-modal="true" aria-labelledby="ticket-titulo">
                <button id="btn-cerrar-modal" class="btn-cerrar-modal" aria-label="Cerrar confirmación">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>

                <div class="ticket-header">
                    <div class="ticket-icono-exito">
                        <svg viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <h3 id="ticket-titulo" class="ticket-titulo">¡Pedido Confirmado!</h3>
                    <p class="ticket-subtitulo">Tu orden ha sido registrada exitosamente</p>
                    <div id="ticket-numero-orden" class="ticket-numero-orden">#QO-101</div>
                </div>

                <div class="ticket-cuerpo">
                    <div class="ticket-metadatos">
                        <div class="ticket-metadato-item">
                            <strong>Fecha & Hora</strong>
                            <span id="ticket-fecha-hora">--</span>
                        </div>
                        <div class="ticket-metadato-item">
                            <strong>Estado</strong>
                            <span style="color: #28a745;">En Preparación</span>
                        </div>
                        <div class="ticket-metadato-item">
                            <strong>Servicio</strong>
                            <span>Para Llevar / Domicilio</span>
                        </div>
                        <div class="ticket-metadato-item">
                            <strong>Pago</strong>
                            <span>Contra Entrega / Nequi</span>
                        </div>
                    </div>

                    <div class="ticket-productos-seccion">
                        <div class="ticket-productos-titulo">Detalle del Pedido</div>
                        <ul id="ticket-productos-lista" class="ticket-productos-lista">
                            <!-- Inyección dinámica -->
                        </ul>
                    </div>

                    <div class="ticket-resumen">
                        <div class="ticket-resumen-fila">
                            <span>Subtotal:</span>
                            <span id="ticket-subtotal">$ 0</span>
                        </div>
                        <div class="ticket-resumen-fila">
                            <span>Costo de Envío:</span>
                            <span style="color: #28a745; font-weight: 700;">¡Gratis!</span>
                        </div>
                        <div class="ticket-resumen-total">
                            <span>Total Pagado:</span>
                            <span id="ticket-total">$ 0</span>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button id="btn-whatsapp-confirmar" class="btn-whatsapp-confirmar">
                        <svg viewBox="0 0 24 24">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.61c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
                        </svg>
                        Enviar Pedido a WhatsApp
                    </button>
                    <div class="modal-acciones-secundarias">
                        <button id="btn-imprimir-ticket" class="btn-imprimir-ticket">
                            Imprimir Recibo
                        </button>
                        <button id="btn-nuevo-pedido" class="btn-nuevo-pedido">
                            Hacer Otro Pedido
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        // Listeners del modal
        const btnCerrarModal = document.getElementById('btn-cerrar-modal');
        const btnNuevoPedido = document.getElementById('btn-nuevo-pedido');
        const btnImprimirTicket = document.getElementById('btn-imprimir-ticket');

        if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalConfirmacion);
        if (btnNuevoPedido) btnNuevoPedido.addEventListener('click', () => {
            cerrarModalConfirmacion();
            vaciarCarrito();
        });
        if (btnImprimirTicket) btnImprimirTicket.addEventListener('click', () => window.print());

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModalConfirmacion();
        });
    }
    return modalOverlay;
}

/**
 * Abrir el modal de confirmación con datos del pedido tipo McDonald's
 */
function abrirModalConfirmacion() {
    if (pedido.length === 0) return;

    const modalOverlay = asegurarModalEnDOM();
    const numeroOrden = generarNumeroOrden();
    const fechaHora = obtenerFechaHoraActual();
    const totalMonto = pedido.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // Actualizar campos del recibo
    document.getElementById('ticket-numero-orden').textContent = numeroOrden;
    document.getElementById('ticket-fecha-hora').textContent = fechaHora;
    document.getElementById('ticket-subtotal').textContent = formatearPrecio(totalMonto);
    document.getElementById('ticket-total').textContent = formatearPrecio(totalMonto);

    // Listar productos
    const listaProductos = document.getElementById('ticket-productos-lista');
    listaProductos.innerHTML = pedido.map(item => `
        <li class="ticket-producto-fila">
            <div class="ticket-producto-detalle">
                <span class="ticket-producto-cant">${item.cantidad}x</span>
                <span class="ticket-producto-nombre">${item.nombre}</span>
            </div>
            <span class="ticket-producto-precio">${formatearPrecio(item.precio * item.cantidad)}</span>
        </li>
    `).join('');

    // Configurar enlace de WhatsApp con formato profesional
    let textoWhatsApp = `🍔 *NUEVO PEDIDO QUICKORDER*\n`;
    textoWhatsApp += `📌 *Orden:* ${numeroOrden}\n`;
    textoWhatsApp += `📅 *Fecha:* ${fechaHora}\n\n`;
    textoWhatsApp += `*PRODUCTOS:*\n`;
    pedido.forEach(item => {
        textoWhatsApp += `• ${item.cantidad}x ${item.nombre} → ${formatearPrecio(item.precio * item.cantidad)}\n`;
    });
    textoWhatsApp += `\n💰 *TOTAL A PAGAR:* ${formatearPrecio(totalMonto)}\n`;
    textoWhatsApp += `📍 *Servicio:* Domicilio / Para Llevar\n`;
    textoWhatsApp += `¡Muchas gracias!`;

    const btnWhatsApp = document.getElementById('btn-whatsapp-confirmar');
    btnWhatsApp.onclick = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(textoWhatsApp)}`;
        window.open(url, '_blank');
    };

    // Cerrar panel del carrito y abrir modal elegante
    cerrarCarrito();
    modalOverlay.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar el modal de confirmación
 */
function cerrarModalConfirmacion() {
    const modalOverlay = document.getElementById('modal-confirmacion-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('activo');
        document.body.style.overflow = '';
    }
}

/**
 * Finalizar pedido lanzando el Kiosco / Modal Profesional
 */
function finalizarPedido() {
    if (pedido.length === 0) return;
    abrirModalConfirmacion();
}

/**
 * Inicialización de Eventos y Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar estado inicial
    cargarPedido();
    actualizarInterfaz();
    asegurarModalEnDOM();

    // 2. Eventos de apertura / cierre del carrito
    if (btnAbrirCarrito) btnAbrirCarrito.addEventListener('click', abrirCarrito);
    if (btnCerrarCarrito) btnCerrarCarrito.addEventListener('click', cerrarCarrito);
    if (carritoOverlay) carritoOverlay.addEventListener('click', cerrarCarrito);

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarCarrito();
            cerrarModalConfirmacion();
        }
    });

    // 3. Delegación de eventos en los botones "Agregar al Pedido" de las tarjetas
    const botonesAgregar = document.querySelectorAll('.btn-agregar');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function() {
            const nombre = this.dataset.nombre;
            const valor = Number(this.dataset.valor);

            agregarProducto(nombre, valor);

            // Feedback visual temporal en el botón
            const textoOriginal = this.textContent;
            this.textContent = '¡Agregado!';
            this.classList.add('agregado');

            setTimeout(() => {
                this.textContent = textoOriginal;
                this.classList.remove('agregado');
            }, 1000);
        });
    });

    // 4. Delegación de eventos dentro del drawer del carrito
    if (carritoCuerpo) {
        carritoCuerpo.addEventListener('click', (e) => {
            const botonAccion = e.target.closest('button[data-accion]');
            if (!botonAccion) return;

            const accion = botonAccion.dataset.accion;
            const nombre = botonAccion.dataset.nombre;

            if (accion === 'incrementar') {
                cambiarCantidad(nombre, 1);
            } else if (accion === 'decrementar') {
                cambiarCantidad(nombre, -1);
            } else if (accion === 'eliminar') {
                eliminarProducto(nombre);
            }
        });
    }

    // 5. Botones de vaciar y finalizar pedido
    if (btnVaciarCarrito) btnVaciarCarrito.addEventListener('click', vaciarCarrito);
    if (btnFinalizarPedido) btnFinalizarPedido.addEventListener('click', finalizarPedido);
});
