/**
 * Analytics Dashboard
 * - Ventas por hora
 * - Top 5 platos
 * - Selector de período (Hoy / Esta semana / Este mes)
 * - Exportar a CSV
 */

const ANALYTICS = {
  period: 'today', // 'today', 'week', 'month'
  
  // Mock data: órdenes con estado "Entregado"
  mockOrders: [
    { id: 'ORD-001', timestamp: new Date(new Date().setHours(8, 15)), estado: 'Entregado', items: [{ id: 'e1', name: 'Menú del día', qty: 2, price: 14000 }, { id: 'b1', name: 'Limonada', qty: 2, price: 4000 }], total: 36000 },
    { id: 'ORD-002', timestamp: new Date(new Date().setHours(8, 45)), estado: 'Entregado', items: [{ id: 'e2', name: 'Pizza', qty: 1, price: 15000 }], total: 15000 },
    { id: 'ORD-003', timestamp: new Date(new Date().setHours(12, 30)), estado: 'Entregado', items: [{ id: 'p1', name: 'Bandeja Saludable', qty: 1, price: 20000 }, { id: 'b3', name: 'Café', qty: 1, price: 5000 }], total: 25000 },
    { id: 'ORD-004', timestamp: new Date(new Date().setHours(12, 50)), estado: 'Entregado', items: [{ id: 'e3', name: 'Hamburgesa con papas fritas', qty: 1, price: 20000 }], total: 20000 },
    { id: 'ORD-005', timestamp: new Date(new Date().setHours(13, 15)), estado: 'Entregado', items: [{ id: 'p2', name: 'Sopa de pollo', qty: 2, price: 15000 }, { id: 'e1', name: 'Menú del día', qty: 1, price: 14000 }], total: 44000 },
    { id: 'ORD-006', timestamp: new Date(new Date().setHours(18, 30)), estado: 'Entregado', items: [{ id: 'e1', name: 'Menú del día', qty: 1, price: 14000 }, { id: 'd1', name: 'Pastel de Chocolate', qty: 1, price: 30000 }], total: 44000 },
    { id: 'ORD-007', timestamp: new Date(new Date().setHours(19, 0)), estado: 'Entregado', items: [{ id: 'p3', name: 'Pollo con caldo', qty: 1, price: 28000 }, { id: 'b4', name: 'Jugo de mora', qty: 1, price: 5000 }], total: 33000 },
  ],

  getOrdersByPeriod() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return this.mockOrders.filter(order => {
      const orderDate = new Date(order.timestamp.getFullYear(), order.timestamp.getMonth(), order.timestamp.getDate());
      
      if (this.period === 'today') {
        return orderDate.getTime() === today.getTime();
      } else if (this.period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo && orderDate <= today;
      } else if (this.period === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(1);
        return orderDate >= monthAgo && orderDate <= today;
      }
      return true;
    });
  },

  getSalesByHour() {
    const orders = this.getOrdersByPeriod();
    const hourly = Array(24).fill(0);
    
    orders.forEach(order => {
      const hour = order.timestamp.getHours();
      hourly[hour] += order.total;
    });
    
    return hourly;
  },

  getTop5Dishes() {
    const orders = this.getOrdersByPeriod();
    const dishMap = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!dishMap[item.id]) {
          dishMap[item.id] = { id: item.id, name: item.name, qty: 0, revenue: 0 };
        }
        dishMap[item.id].qty += item.qty;
        dishMap[item.id].revenue += item.qty * item.price;
      });
    });
    
    return Object.values(dishMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  },

  exportCSV() {
    const orders = this.getOrdersByPeriod();
    if (orders.length === 0) {
      alert('No hay datos para exportar en este período');
      return;
    }

    let csv = 'ID Pedido,Fecha,Hora,Estado,Platos,Cantidad,Precio Unitario,Total\n';
    
    orders.forEach(order => {
      const date = order.timestamp.toLocaleDateString('es-CO');
      const time = order.timestamp.toLocaleTimeString('es-CO');
      const itemsStr = order.items.map(i => `${i.name} (${i.qty}x)`).join('; ');
      const qtyStr = order.items.map(i => i.qty).join('; ');
      const pricesStr = order.items.map(i => i.price).join('; ');
      
      csv += `${order.id},"${date}","${time}","${order.estado}","${itemsStr}","${qtyStr}","${pricesStr}",${order.total}\n`;
    });

    // Crear descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas-${this.period}-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  },

  renderChart() {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;

    const hourly = this.getSalesByHour();
    const maxVal = Math.max(...hourly) || 100000;
    const padding = 40;
    const width = canvas.width;
    const height = canvas.height;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const barWidth = chartWidth / 24;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid y ejes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Barras
    ctx.fillStyle = '#1B6B3A';
    hourly.forEach((val, hour) => {
      const barHeight = (val / maxVal) * chartHeight;
      const x = padding + hour * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
    });

    // Etiquetas X (cada 3 horas)
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    for (let h = 0; h < 24; h += 3) {
      const x = padding + h * barWidth + barWidth / 2;
      const y = height - padding + 20;
      ctx.fillText(`${String(h).padStart(2, '0')}h`, x, y);
    }

    // Etiquetas Y - usar formatCOP si está disponible
    ctx.textAlign = 'right';
    const formatFunc = typeof formatCOP !== 'undefined' ? formatCOP : (val) => `$${val}`;
    for (let i = 0; i <= 5; i++) {
      const val = Math.round((maxVal / 5) * i);
      const y = height - padding - (chartHeight / 5) * i + 4;
      ctx.fillText(formatFunc(val), padding - 10, y);
    }
  },

  render() {
    this.renderChart();
    this.renderTop5();
  },

  renderTop5() {
    const container = document.getElementById('top-5-dishes');
    if (!container) return;

    const dishes = this.getTop5Dishes();
    const formatFunc = typeof formatCOP !== 'undefined' ? formatCOP : (val) => `$${val}`;
    
    if (dishes.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <svg class="w-16 h-16 text-slate-300 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375M9 16.5v5.625m0-5.625h6m-6 5.625h6m6-15.75h-2.25A2.25 2.25 0 0019.5 4.125V2.25h-15v1.875c0 1.243.975 2.25 2.25 2.25H3"></path>
          </svg>
          <p class="text-slate-500 font-medium">No hay datos en este período</p>
        </div>
      `;
      return;
    }

    const totalRevenue = this.getOrdersByPeriod().reduce((a, o) => a + o.total, 0) || 1;
    const html = dishes.map((dish, idx) => `
      <div class="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="text-lg font-bold text-slate-400 w-6 text-center">#${idx + 1}</div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-slate-800 truncate">${dish.name}</p>
            <p class="text-sm text-slate-500">${dish.qty} unidades vendidas</p>
          </div>
        </div>
        <div class="text-right ml-4 flex-shrink-0">
          <p class="font-bold text-primary">${formatFunc(dish.revenue)}</p>
          <p class="text-xs text-slate-500">${(dish.revenue / totalRevenue * 100).toFixed(1)}% del total</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }
};

window.ANALYTICS = ANALYTICS;
