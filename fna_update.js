
// Add to displayFNAResults function - after generating consultation topics
// Render dashboard charts
renderFNADashboardCharts(totalIncome, totalExpenses, cashFlow, totalAssets, totalDebts);

// Generate tax savings suggestions
generateTaxSavingsSuggestions(totalIncome, totalAssets, totalDebts, cashFlow);
}

// NEW FUNCTION: Render FNA Dashboard Charts
function renderFNADashboardCharts(totalIncome, totalExpenses, cashFlow, totalAssets, totalDebts) {
  // 1. Cash Flow Pie Chart
  const cashFlowCtx = document.getElementById('fnaCashFlowChart').getContext('2d');
  new Chart(cashFlowCtx, {
    type: 'doughnut',
    data: {
      labels: ['Expenses', 'Savings'],
      datasets: [{
        data: [totalExpenses, Math.max(0, cashFlow)],
        backgroundColor: ['#ef4444', '#10b981'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 12, usePointStyle: true, font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = totalIncome;
              const percentage = ((value / total) * 100).toFixed(1);
              return context.label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });

  // 2. Asset Allocation Doughnut Chart
  const assetCtx = document.getElementById('fnaAssetChart').getContext('2d');
  const assetLabels = [];
  const assetData = [];
  const assetColors = ['#0891b2', '#06b6d4', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

  if (fnaData.assetsCash > 0) { assetLabels.push('Cash'); assetData.push(fnaData.assetsCash); }
  if (fnaData.assetsRRSP > 0) { assetLabels.push('RRSP'); assetData.push(fnaData.assetsRRSP); }
  if (fnaData.assetsTFSA > 0) { assetLabels.push('TFSA'); assetData.push(fnaData.assetsTFSA); }
  if (fnaData.assetsRESP > 0) { assetLabels.push('RESP'); assetData.push(fnaData.assetsRESP); }
  if (fnaData.assetsInvestments > 0) { assetLabels.push('Investments'); assetData.push(fnaData.assetsInvestments); }
  if (fnaData.assetsHome > 0) { assetLabels.push('Home'); assetData.push(fnaData.assetsHome); }
  if (fnaData.assetsOther > 0) { assetLabels.push('Other'); assetData.push(fnaData.assetsOther); }

  if (assetData.length === 0) {
    assetLabels.push('No Assets');
    assetData.push(1);
  }

  new Chart(assetCtx, {
    type: 'doughnut',
    data: {
      labels: assetLabels,
      datasets: [{
        data: assetData,
        backgroundColor: assetColors.slice(0, assetData.length),
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 8, usePointStyle: true, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.label === 'No Assets') return 'No assets recorded';
              const value = context.parsed;
              const percentage = ((value / totalAssets) * 100).toFixed(1);
              return context.label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });

  // 3. Debt Breakdown Bar Chart
  const debtCtx = document.getElementById('fnaDebtChart').getContext('2d');
  const debtLabels = [];
  const debtData = [];

  if (fnaData.debtMortgage > 0) { debtLabels.push('Mortgage'); debtData.push(fnaData.debtMortgage); }
  if (fnaData.debtCredit > 0) { debtLabels.push('Credit Cards'); debtData.push(fnaData.debtCredit); }
  if (fnaData.debtCar > 0) { debtLabels.push('Car Loans'); debtData.push(fnaData.debtCar); }
  if (fnaData.debtStudent > 0) { debtLabels.push('Student Loans'); debtData.push(fnaData.debtStudent); }
  if (fnaData.debtOther > 0) { debtLabels.push('Other'); debtData.push(fnaData.debtOther); }

  if (debtData.length === 0) {
    debtLabels.push('No Debt');
    debtData.push(1);
  }

  new Chart(debtCtx, {
    type: 'bar',
    data: {
      labels: debtLabels,
      datasets: [{
        label: 'Debt Amount',
        data: debtData,
        backgroundColor: debtData.length === 1 && debtLabels[0] === 'No Debt' ? '#10b981' : '#ef4444',
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.label === 'No Debt') return 'No debt - great job!';
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
          }
        }
      }
    }
  });

  // 4. Savings Rate Gauge (Semi-circle)
  const savingsRateCtx = document.getElementById('fnaSavingsRateChart').getContext('2d');
  const savingsRate = totalIncome > 0 ? Math.min(100, (cashFlow / totalIncome) * 100) : 0;
  const remainingRate = Math.max(0, 100 - savingsRate);

  new Chart(savingsRateCtx, {
    type: 'doughnut',
    data: {
      labels: ['Savings Rate', 'Remaining'],
      datasets: [{
        data: [savingsRate, remainingRate],
        backgroundColor: [
          savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444',
          '#e2e8f0'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      circumference: 180,
      rotation: 270,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) {
                return 'Savings Rate: ' + savingsRate.toFixed(1) + '%';
              }
              return null;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'gaugeText',
      afterDatasetDraw(chart) {
        const ctx = chart.ctx;
        const width = chart.width;
        const height = chart.height;

        ctx.save();
        const centerX = width / 2;
        const centerY = height * 0.85;

        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(savingsRate.toFixed(1) + '%', centerX, centerY);

        ctx.font = '12px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('of income saved', centerX, centerY + 25);

        ctx.restore();
      }
    }]
  });
}

// NEW FUNCTION: Generate Tax Savings Suggestions
function generateTaxSavingsSuggestions(totalIncome, totalAssets, totalDebts, cashFlow) {
  const taxSavingsDiv = document.getElementById('fnaTaxSavings');
  let suggestions = '';

  const annualIncome = totalIncome * 12;
  const taxRate = fnaData.taxRate / 100;

  // RRSP Suggestion
  const maxRRSPContribution = annualIncome * 0.18; // 18% of income
  const currentRRSP = fnaData.assetsRRSP;
  const rrspRoom = Math.max(0, maxRRSPContribution);

  if (rrspRoom > 1000 && currentRRSP < annualIncome * 0.5) {
    const potentialRRSPContribution = Math.min(rrspRoom, cashFlow * 12 * 0.3);
    const rrspTaxSavings = potentialRRSPContribution * taxRate;

    suggestions += '<div class="fna-tax-savings-card">';
    suggestions += '<div class="fna-tax-savings-icon">🏦</div>';
    suggestions += '<div class="fna-tax-savings-content">';
    suggestions += '<h5>RRSP Tax Deduction</h5>';
    suggestions += '<div class="fna-tax-savings-amount">' + formatCurrency(rrspTaxSavings) + ' tax refund</div>';
    suggestions += '<p>By contributing ' + formatCurrency(potentialRRSPContribution) + ' to your RRSP, you could get a tax refund of approximately ' + formatCurrency(rrspTaxSavings) + '. This reduces your taxable income and grows tax-free until retirement.</p>';
    suggestions += '<div class="fna-tax-savings-details">';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Recommended Contribution</div><div class="fna-tax-savings-detail-value">' + formatCurrency(potentialRRSPContribution) + '</div></div>';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Your Tax Rate</div><div class="fna-tax-savings-detail-value">' + (taxRate * 100).toFixed(0) + '%</div></div>';
    suggestions += '</div></div></div>';
  }

  // TFSA Suggestion
  const tfsaLimit = 95000; // 2024 cumulative limit
  const currentTFSA = fnaData.assetsTFSA;
  const tfsaRoom = Math.max(0, tfsaLimit - currentTFSA);

  if (tfsaRoom > 1000) {
    const potentialTFSAContribution = Math.min(tfsaRoom, cashFlow * 12 * 0.2);
    const tfsa10YearGrowth = potentialTFSAContribution * Math.pow(1.06, 10);
    const tfsa10YearTaxSavings = (tfsa10YearGrowth - potentialTFSAContribution) * 0.25; // Tax on gains

    suggestions += '<div class="fna-tax-savings-card">';
    suggestions += '<div class="fna-tax-savings-icon">💎</div>';
    suggestions += '<div class="fna-tax-savings-content">';
    suggestions += '<h5>TFSA Tax-Free Growth</h5>';
    suggestions += '<div class="fna-tax-savings-amount">' + formatCurrency(tfsa10YearTaxSavings) + ' tax saved over 10 years</div>';
    suggestions += '<p>Invest ' + formatCurrency(potentialTFSAContribution) + ' in your TFSA to grow completely tax-free. Over 10 years at 6% return, you would save approximately ' + formatCurrency(tfsa10YearTaxSavings) + ' in taxes compared to a non-registered account.</p>';
    suggestions += '<div class="fna-tax-savings-details">';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Available Room</div><div class="fna-tax-savings-detail-value">' + formatCurrency(tfsaRoom) + '</div></div>';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">10-Year Value</div><div class="fna-tax-savings-detail-value">' + formatCurrency(tfsa10YearGrowth) + '</div></div>';
    suggestions += '</div></div></div>';
  }

  // FHSA Suggestion (First Home Savings Account)
  if (fnaData.goals.home && currentTFSA < 40000 && fnaData.assetsHome === 0) {
    const fhsaAnnualLimit = 8000;
    const fhsaTaxSavings = fhsaAnnualLimit * taxRate;

    suggestions += '<div class="fna-tax-savings-card">';
    suggestions += '<div class="fna-tax-savings-icon">🏡</div>';
    suggestions += '<div class="fna-tax-savings-content">';
    suggestions += '<h5>FHSA for First-Time Home Buyers</h5>';
    suggestions += '<div class="fna-tax-savings-amount">' + formatCurrency(fhsaTaxSavings) + ' annual tax refund</div>';
    suggestions += '<p>Since you are planning to buy a home, the FHSA gives you BOTH a tax deduction (like RRSP) AND tax-free withdrawal (like TFSA). Contributing ' + formatCurrency(fhsaAnnualLimit) + ' annually gives you a ' + formatCurrency(fhsaTaxSavings) + ' tax refund while saving for your down payment.</p>';
    suggestions += '<div class="fna-tax-savings-details">';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Annual Limit</div><div class="fna-tax-savings-detail-value">' + formatCurrency(fhsaAnnualLimit) + '</div></div>';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Lifetime Limit</div><div class="fna-tax-savings-detail-value">$40,000</div></div>';
    suggestions += '</div></div></div>';
  }

  // RESP Suggestion
  if (fnaData.dependents > 0 && fnaData.goals.education) {
    const respAnnualGrant = 500 * fnaData.dependents; // Max $500 grant per child
    const respContribution = 2500 * fnaData.dependents; // $2500 per child for max grant

    suggestions += '<div class="fna-tax-savings-card">';
    suggestions += '<div class="fna-tax-savings-icon">🎓</div>';
    suggestions += '<div class="fna-tax-savings-content">';
    suggestions += '<h5>RESP Education Grants</h5>';
    suggestions += '<div class="fna-tax-savings-amount">' + formatCurrency(respAnnualGrant) + ' FREE government money</div>';
    suggestions += '<p>With ' + fnaData.dependents + ' dependent(s), contribute ' + formatCurrency(respContribution) + ' annually to RESP to receive ' + formatCurrency(respAnnualGrant) + ' in Canada Education Savings Grants (CESG). That is a guaranteed 20% return plus tax-free growth!</p>';
    suggestions += '<div class="fna-tax-savings-details">';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Annual Contribution</div><div class="fna-tax-savings-detail-value">' + formatCurrency(respContribution) + '</div></div>';
    suggestions += '<div class="fna-tax-savings-detail"><div class="fna-tax-savings-detail-label">Lifetime Grant/Child</div><div class="fna-tax-savings-detail-value">$7,200</div></div>';
    suggestions += '</div></div></div>';
  }

  // Income Splitting (if married)
  if (fnaData.married && fnaData.income1 > 0 && fnaData.income2 > 0) {
    const incomeDiff = Math.abs(fnaData.income1 - fnaData.income2);
    if (incomeDiff > fnaData.income1 * 0.3) {
      const splittingSavings = (incomeDiff * 12) * 0.1; // Rough estimate

      suggestions += '<div class="fna-tax-savings-card">';
      suggestions += '<div class="fna-tax-savings-icon">👫</div>';
      suggestions += '<div class="fna-tax-savings-content">';
      suggestions += '<h5>Income Splitting Strategies</h5>';
      suggestions += '<div class="fna-tax-savings-amount">Up to ' + formatCurrency(splittingSavings) + ' annual savings</div>';
      suggestions += '<p>With a significant income difference between you and your spouse, income splitting through spousal RRSPs, pension splitting, or family business structures could save you thousands in taxes annually.</p>';
      suggestions += '</div></div>';
    }
  }

  // Total potential savings summary
  let totalAnnualSavings = 0;
  if (rrspRoom > 1000) totalAnnualSavings += potentialRRSPContribution * taxRate;
  if (fnaData.goals.home && fnaData.assetsHome === 0) totalAnnualSavings += 8000 * taxRate;
  if (fnaData.dependents > 0) totalAnnualSavings += 500 * fnaData.dependents;

  if (totalAnnualSavings > 1000) {
    suggestions = '<div class="fna-tax-savings-card" style="background: linear-gradient(135deg, #fef3c7, #fde047); border-left-color: #f59e0b; border-width: 4px;"><div class="fna-tax-savings-icon">🎯</div><div class="fna-tax-savings-content"><h5>Total Annual Tax Savings Potential</h5><div class="fna-tax-savings-amount" style="font-size: 32px; color: #92400e;">' + formatCurrency(totalAnnualSavings) + '</div><p style="font-size: 16px; color: #78350f;"><strong>By implementing the strategies below, you could save approximately ' + formatCurrency(totalAnnualSavings) + ' in your first year alone!</strong></p></div></div>' + suggestions;
  }

  if (!suggestions) {
    suggestions = '<p style="color: #64748b; text-align: center;">Great job! You are maximizing your tax-advantaged accounts. Continue the good work!</p>';
  }

  taxSavingsDiv.innerHTML = suggestions;
