/* ===== BlueBush Admin Charts ===== */
/* Uses Chart.js loaded via CDN in admin.html */

const adminCharts = {
  _charts: {},

  /**
   * Destroys an existing chart by key before creating a new one.
   */
  _destroy(key) {
    if (this._charts[key]) {
      this._charts[key].destroy();
      delete this._charts[key];
    }
  },

  /**
   * Renders a doughnut chart showing stock status distribution.
   * @param {string} canvasId
   * @param {{ inStock: number, lowStock: number, outOfStock: number }} data
   */
  renderStockChart(canvasId, data) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
          data: [data.inStock, data.lowStock, data.outOfStock],
          backgroundColor: ['#286a58', '#ca8a04', '#dc2626'],
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              color: '#1B3022',
              padding: 16,
              boxWidth: 12,
              boxHeight: 12,
            }
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * Renders a horizontal bar chart showing product counts per category.
   * @param {string} canvasId
   * @param {{ labels: string[], counts: number[] }} data
   */
  renderCategoryChart(canvasId, data) {
    this._destroy(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this._charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Products',
          data: data.counts,
          backgroundColor: '#1B3022',
          borderRadius: 5,
          maxBarThickness: 28,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x} products`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              stepSize: 1,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: '#6b7280',
            },
            grid: { color: '#f3f4f6' }
          },
          y: {
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              color: '#1B3022',
            },
            grid: { display: false }
          }
        }
      }
    });
  },

  /**
   * Builds chart data from the products array and renders both charts.
   * @param {Array} products
   */
  renderDashboardCharts(products) {
    let inStock = 0, lowStock = 0, outOfStock = 0;
    const categoryCounts = {};

    products.forEach(p => {
      const s = p.dynamic_data.stock_level;
      if (s === 0) outOfStock++;
      else if (s < 10) lowStock++;
      else inStock++;
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    this.renderStockChart('stock-chart', { inStock, lowStock, outOfStock });

    const sortedCats = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);
    this.renderCategoryChart('category-chart', {
      labels: sortedCats.map(e => e[0]),
      counts: sortedCats.map(e => e[1]),
    });
  }
};
