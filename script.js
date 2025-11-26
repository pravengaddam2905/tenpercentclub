// ===== Mobile Menu Toggle =====
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

// Close menu on link click (mobile)
document.querySelectorAll('#menu a').forEach(a => {
  a.addEventListener('click', () => {
    menu.classList.remove('open');
  });
});

// ===== Tab Switching =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    
    // Remove active class from all buttons and contents
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    btn.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// ===== Comprehensive Tax Calculator =====
const incomeSlider = document.getElementById('income');
const rrspSlider = document.getElementById('rrsp');
const tfsaSlider = document.getElementById('tfsa');
const fhsaSlider = document.getElementById('fhsa');
const respSlider = document.getElementById('resp');
const spouseRRSPSlider = document.getElementById('spouseRRSP');

const rrspEnabled = document.getElementById('rrspEnabled');
const tfsaEnabled = document.getElementById('tfsaEnabled');
const fhsaEnabled = document.getElementById('fhsaEnabled');
const respEnabled = document.getElementById('respEnabled');
const spouseRRSPEnabled = document.getElementById('spouseRRSPEnabled');

function formatCurrency(value) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function getMarginalTaxRate(income) {
  // Ontario 2024 combined federal + provincial marginal tax rates
  if (income > 235675) {
    return 0.5353; // Top bracket
  } else if (income > 173205) {
    return 0.4862;
  } else if (income > 106717) {
    return 0.4341;
  } else if (income > 86698) {
    return 0.3148;
  } else if (income > 55867) {
    return 0.2965;
  } else if (income > 51446) {
    return 0.2457;
  } else if (income > 0) {
    return 0.2005; // Lowest bracket
  } else {
    return 0; // No income
  }
}

function getTaxBracketInfo(income) {
  if (income === 0) {
    return { range: '-', rate: '-' };
  } else if (income > 235675) {
    return { range: 'Over $235,675', rate: '53.53%' };
  } else if (income > 173205) {
    return { range: '$173,206 - $235,675', rate: '48.62%' };
  } else if (income > 106717) {
    return { range: '$106,718 - $173,205', rate: '43.41%' };
  } else if (income > 86698) {
    return { range: '$86,699 - $106,717', rate: '31.48%' };
  } else if (income > 55867) {
    return { range: '$55,868 - $86,698', rate: '29.65%' };
  } else if (income > 51446) {
    return { range: '$51,447 - $55,867', rate: '24.57%' };
  } else {
    return { range: 'Up to $51,446', rate: '20.05%' };
  }
}

function calculateTaxSavings(income, contribution) {
  const taxRate = getMarginalTaxRate(income);
  return Math.round(contribution * taxRate);
}

function calculateRESPGrant(respContribution) {
  // Basic CESG is 20% of contribution, max $500/year (on first $2,500)
  return Math.min(Math.round(respContribution * 0.20), 500);
}

function updateCalculator() {
  const income = parseInt(incomeSlider.value);

  // Update income display
  document.getElementById('incomeValue').textContent = formatCurrency(income);

  // Show/hide sections based on income
  const limitsSection = document.getElementById('limitsSection');
  const contributionsSection = document.getElementById('contributionsSection');
  const taxBracketInfo = document.getElementById('taxBracketInfo');

  if (income > 0) {
    limitsSection.style.display = 'block';
    contributionsSection.style.display = 'block';
    taxBracketInfo.style.display = 'block';

    // Update tax bracket info
    const bracketInfo = getTaxBracketInfo(income);
    document.getElementById('taxBracketValue').textContent = bracketInfo.range;
    document.getElementById('taxBracketRate').textContent = `Marginal Rate: ${bracketInfo.rate}`;

    // Update max RRSP limit (18% of income, max $31,560 for 2024)
    const maxRRSPLimit = Math.min(Math.round(income * 0.18), 31560);
    document.getElementById('maxRRSP').textContent = formatCurrency(maxRRSPLimit);

    // Update RRSP slider max
    rrspSlider.max = maxRRSPLimit;
  } else {
    limitsSection.style.display = 'none';
    contributionsSection.style.display = 'none';
    taxBracketInfo.style.display = 'none';
    document.getElementById('summarySection').style.display = 'none';
    return;
  }

  // Calculate contributions and savings
  let totalContributions = 0;
  let totalRefunds = 0;
  let hasContributions = false;

  // RRSP Calculation
  const rrsp = parseInt(rrspSlider.value);
  document.getElementById('rrspValue').textContent = formatCurrency(rrsp);

  if (rrspEnabled.checked) {
    const rrspRefund = calculateTaxSavings(income, rrsp);
    document.getElementById('rrspSavings').textContent = `Tax Refund: ${formatCurrency(rrspRefund)}`;
    totalContributions += rrsp;
    totalRefunds += rrspRefund;

    if (rrsp > 0) {
      hasContributions = true;
      document.getElementById('summaryRRSPRow').style.display = 'flex';
      document.getElementById('summaryRRSP').textContent = formatCurrency(rrsp);
      document.getElementById('summaryRRSPRefund').textContent = formatCurrency(rrspRefund);
    } else {
      document.getElementById('summaryRRSPRow').style.display = 'none';
    }
  } else {
    document.getElementById('rrspSavings').textContent = 'Select to calculate tax refund';
    document.getElementById('summaryRRSPRow').style.display = 'none';
  }

  // TFSA Calculation (no immediate tax benefit)
  const tfsa = parseInt(tfsaSlider.value);
  document.getElementById('tfsaValue').textContent = formatCurrency(tfsa);

  if (tfsaEnabled.checked) {
    document.getElementById('tfsaSavings').textContent = 'No immediate tax refund (tax-free growth)';
    totalContributions += tfsa;

    if (tfsa > 0) {
      hasContributions = true;
      document.getElementById('summaryTFSARow').style.display = 'flex';
      document.getElementById('summaryTFSA').textContent = formatCurrency(tfsa);
    } else {
      document.getElementById('summaryTFSARow').style.display = 'none';
    }
  } else {
    document.getElementById('tfsaSavings').textContent = 'Select to add contribution';
    document.getElementById('summaryTFSARow').style.display = 'none';
  }

  // FHSA Calculation (tax-deductible like RRSP)
  const fhsa = parseInt(fhsaSlider.value);
  document.getElementById('fhsaValue').textContent = formatCurrency(fhsa);

  if (fhsaEnabled.checked) {
    const fhsaRefund = calculateTaxSavings(income, fhsa);
    document.getElementById('fhsaSavings').textContent = `Tax Refund: ${formatCurrency(fhsaRefund)}`;
    totalContributions += fhsa;
    totalRefunds += fhsaRefund;

    if (fhsa > 0) {
      hasContributions = true;
      document.getElementById('summaryFHSARow').style.display = 'flex';
      document.getElementById('summaryFHSA').textContent = formatCurrency(fhsa);
      document.getElementById('summaryFHSARefund').textContent = formatCurrency(fhsaRefund);
    } else {
      document.getElementById('summaryFHSARow').style.display = 'none';
    }
  } else {
    document.getElementById('fhsaSavings').textContent = 'Select to calculate tax refund';
    document.getElementById('summaryFHSARow').style.display = 'none';
  }

  // RESP Calculation (government grant)
  const resp = parseInt(respSlider.value);
  document.getElementById('respValue').textContent = formatCurrency(resp);

  if (respEnabled.checked) {
    const respGrant = calculateRESPGrant(resp);
    document.getElementById('respSavings').textContent = `Government Grant: ${formatCurrency(respGrant)}`;
    totalContributions += resp;
    totalRefunds += respGrant;

    if (resp > 0) {
      hasContributions = true;
      document.getElementById('summaryRESPRow').style.display = 'flex';
      document.getElementById('summaryRESP').textContent = formatCurrency(resp);
      document.getElementById('summaryRESPGrant').textContent = formatCurrency(respGrant);
    } else {
      document.getElementById('summaryRESPRow').style.display = 'none';
    }
  } else {
    document.getElementById('respSavings').textContent = 'Select to calculate government grant';
    document.getElementById('summaryRESPRow').style.display = 'none';
  }

  // Spouse RRSP Calculation
  const spouseRRSP = parseInt(spouseRRSPSlider.value);
  document.getElementById('spouseRRSPValue').textContent = formatCurrency(spouseRRSP);

  if (spouseRRSPEnabled.checked) {
    const spouseRRSPRefund = calculateTaxSavings(income, spouseRRSP);
    document.getElementById('spouseRRSPSavings').textContent = `Tax Refund: ${formatCurrency(spouseRRSPRefund)}`;
    totalContributions += spouseRRSP;
    totalRefunds += spouseRRSPRefund;

    if (spouseRRSP > 0) {
      hasContributions = true;
      document.getElementById('summarySpouseRRSPRow').style.display = 'flex';
      document.getElementById('summarySpouseRRSP').textContent = formatCurrency(spouseRRSP);
      document.getElementById('summarySpouseRRSPRefund').textContent = formatCurrency(spouseRRSPRefund);
    } else {
      document.getElementById('summarySpouseRRSPRow').style.display = 'none';
    }
  } else {
    document.getElementById('spouseRRSPSavings').textContent = 'Select to calculate tax refund';
    document.getElementById('summarySpouseRRSPRow').style.display = 'none';
  }

  // Show/hide summary section
  const summarySection = document.getElementById('summarySection');
  if (hasContributions) {
    summarySection.style.display = 'block';

    // Update summary values
    const bracketInfo = getTaxBracketInfo(income);
    document.getElementById('summarySalary').textContent = formatCurrency(income);
    document.getElementById('summaryTaxBracket').textContent = `${bracketInfo.range} (${bracketInfo.rate})`;
    document.getElementById('summaryTotalContributions').textContent = formatCurrency(totalContributions);
    document.getElementById('summaryTotalRefunds').textContent = formatCurrency(totalRefunds);

    const netCost = totalContributions - totalRefunds;
    document.getElementById('summaryNetCost').textContent = formatCurrency(netCost);
  } else {
    summarySection.style.display = 'none';
  }
}

// Enable/disable sliders based on checkboxes
function setupCheckboxListeners() {
  if (rrspEnabled) {
    rrspEnabled.addEventListener('change', () => {
      rrspSlider.disabled = !rrspEnabled.checked;
      updateCalculator();
    });
  }

  if (tfsaEnabled) {
    tfsaEnabled.addEventListener('change', () => {
      tfsaSlider.disabled = !tfsaEnabled.checked;
      updateCalculator();
    });
  }

  if (fhsaEnabled) {
    fhsaEnabled.addEventListener('change', () => {
      fhsaSlider.disabled = !fhsaEnabled.checked;
      updateCalculator();
    });
  }

  if (respEnabled) {
    respEnabled.addEventListener('change', () => {
      respSlider.disabled = !respEnabled.checked;
      updateCalculator();
    });
  }

  if (spouseRRSPEnabled) {
    spouseRRSPEnabled.addEventListener('change', () => {
      spouseRRSPSlider.disabled = !spouseRRSPEnabled.checked;
      updateCalculator();
    });
  }
}

// Initialize calculator
if (incomeSlider) {
  incomeSlider.addEventListener('input', updateCalculator);

  if (rrspSlider) rrspSlider.addEventListener('input', updateCalculator);
  if (tfsaSlider) tfsaSlider.addEventListener('input', updateCalculator);
  if (fhsaSlider) fhsaSlider.addEventListener('input', updateCalculator);
  if (respSlider) respSlider.addEventListener('input', updateCalculator);
  if (spouseRRSPSlider) spouseRRSPSlider.addEventListener('input', updateCalculator);

  setupCheckboxListeners();

  // Initial calculation
  updateCalculator();
}

// ===== Smooth Scroll with Offset for Fixed Header =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Skip if it's just "#"
    if (href === '#') return;
    
    e.preventDefault();
    
    const target = document.querySelector(href);
    if (target) {
      const headerOffset = 100; // Height of sticky header + some padding
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== Footer Year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Form Handlers (Email fallback) =====
// Note: These open the user's email client. For production, connect to Formspree, 
// Getform, or your own backend to capture leads automatically.

// Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());
    
    const subject = encodeURIComponent('Website Inquiry - Ten Percent Club');
    const body = encodeURIComponent(
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || 'Not provided'}\n\n` +
      `Message:\n${data.message}`
    );
    
    // Open email client
    window.location.href = `mailto:tenpercentclub10@gmail.com?subject=${subject}&body=${body}`;
    
    // Show confirmation
    alert('Opening your email client... To capture leads automatically, connect this form to Formspree or Getform.');
  });
}

// Team Interest Form (if you add one)
const teamForm = document.getElementById('teamForm');
if (teamForm) {
  teamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(teamForm);
    const data = Object.fromEntries(formData.entries());
    
    const subject = encodeURIComponent('Team Opportunity Interest - Ten Percent Club');
    const body = encodeURIComponent(
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone || 'Not provided'}\n` +
      `Province: ${data.province || 'Not provided'}\n` +
      `Current Role: ${data.role || 'Not provided'}\n` +
      `Hours Available: ${data.hours || 'Not provided'}\n\n` +
      `Message:\n${data.message}`
    );
    
    window.location.href = `mailto:tenpercentclub10@gmail.com?subject=${subject}&body=${body}`;
    
    alert('Thanks for your interest! Your email client is opening.');
  });
}

// ===== Lead Magnet Download Tracking (Optional Analytics) =====
document.querySelectorAll('.resource-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const resourceName = e.target.closest('.resource-card').querySelector('h3').textContent;
    
    // Track with Google Analytics if you have it set up
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download', {
        'event_category': 'Lead Magnet',
        'event_label': resourceName
      });
    }
    
    // For now, show message that these need to be created
    e.preventDefault();
    alert(`"${resourceName}" will be available soon! Book a call to get personalized guidance in the meantime.`);
  });
});

// ===== Scroll Animation (Optional Enhancement) =====
// Add 'fade-in' class to elements you want to animate
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// ===== Easter Egg: Konami Code =====
// Fun surprise for curious visitors (optional)
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join('') === konamiPattern.join('')) {
    document.body.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #ff6b6b)';
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradient 15s ease infinite';
    
    alert('🎉 You found the secret! As a financial planner, I believe in rewarding curiosity. Book a call and mention "Konami" for a special gift!');
  }
});

// ===== Performance: Lazy Load Calendly =====
// Only load Calendly when user scrolls near the booking section
const bookingSection = document.getElementById('book');
if (bookingSection) {
  const loadCalendly = () => {
    // Calendly is already loaded in the HTML, but you could defer it here
    console.log('Booking section visible - Calendly ready');
  };

  const bookingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadCalendly();
        bookingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  bookingObserver.observe(bookingSection);
}

// ===== Console Message for Developers =====
console.log('%c👋 Hello there!', 'font-size: 20px; font-weight: bold; color: #D4A017;');
console.log('%cInterested in building your own financial planning practice?', 'font-size: 14px;');
console.log('%cEmail tenpercentclub10@gmail.com to learn about team opportunities!', 'font-size: 14px; color: #2563eb;');
// ===== Tool Switcher for Tools Page =====
const toolNavBtns = document.querySelectorAll('.tool-nav-btn');
const toolPanels = document.querySelectorAll('.tool-panel');

toolNavBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTool = btn.getAttribute('data-tool');
    
    // Remove active class from all buttons and panels
    toolNavBtns.forEach(b => b.classList.remove('active'));
    toolPanels.forEach(p => p.classList.remove('active'));
    
    // Add active class to clicked button and corresponding panel
    btn.classList.add('active');
    document.getElementById(targetTool).classList.add('active');

    // Scroll to top of content on mobile
    if (window.innerWidth <= 1024) {
      document.querySelector('.tools-content').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== CAGR Calculator =====

// Show/hide step-up field
const stepUpEnabledCheckbox = document.getElementById('stepUpEnabled');
if (stepUpEnabledCheckbox) {
  stepUpEnabledCheckbox.addEventListener('change', () => {
    const group = document.getElementById('stepUpGroup');
    group.style.display = stepUpEnabledCheckbox.checked ? 'block' : 'none';
  });
}

// Update labels based on period type
const periodTypeSelect = document.getElementById('periodType');
if (periodTypeSelect) {
  periodTypeSelect.addEventListener('change', () => {
    const periodType = periodTypeSelect.value;
    const periodLabel = document.getElementById('periodLabel');
    const investmentPeriodInput = document.getElementById('investmentPeriod');

    if (periodType === 'months') {
      periodLabel.textContent = 'Investment Period (Months)';
      investmentPeriodInput.max = 600; // 50 years max
      investmentPeriodInput.value = Math.min(investmentPeriodInput.value * 12, 600);
    } else {
      periodLabel.textContent = 'Investment Period (Years)';
      investmentPeriodInput.max = 50;
      investmentPeriodInput.value = Math.max(1, Math.floor(investmentPeriodInput.value / 12));
    }
  });
}

// Update step-up labels based on frequency
const stepUpFrequencySelect = document.getElementById('stepUpFrequency');
if (stepUpFrequencySelect) {
  stepUpFrequencySelect.addEventListener('change', () => {
    const frequency = stepUpFrequencySelect.value;
    const stepUpNote = document.getElementById('stepUpNote');
    const stepUpAmountInput = document.getElementById('stepUpAmount');

    if (frequency === 'monthly') {
      stepUpNote.textContent = 'This amount will be added to your investment each month';
      stepUpAmountInput.value = 500;
      stepUpAmountInput.step = 100;
    } else {
      stepUpNote.textContent = 'This amount will be added to your investment each year';
      stepUpAmountInput.value = 5000;
      stepUpAmountInput.step = 1000;
    }
  });
}

function calculateCAGR() {
  const initialValue = parseFloat(document.getElementById('initialValue').value);
  const cagrRate = parseFloat(document.getElementById('cagrRate').value);
  const investmentPeriod = parseFloat(document.getElementById('investmentPeriod').value);
  const periodType = document.getElementById('periodType').value;
  const stepUpEnabled = document.getElementById('stepUpEnabled').checked;
  const stepUpAmount = stepUpEnabled ? parseFloat(document.getElementById('stepUpAmount').value) : 0;
  const stepUpFrequency = stepUpEnabled ? document.getElementById('stepUpFrequency').value : 'annual';

  // Validation
  if (!initialValue || initialValue < 0) {
    alert('Please enter a valid initial investment amount');
    return;
  }

  if (!cagrRate || cagrRate < 0) {
    alert('Please enter a valid annual return rate');
    return;
  }

  if (!investmentPeriod || investmentPeriod <= 0) {
    alert('Please enter a valid investment period');
    return;
  }

  if (stepUpEnabled && (!stepUpAmount || stepUpAmount < 0)) {
    alert('Please enter a valid contribution amount');
    return;
  }

  // Convert everything to months for calculation
  const totalMonths = periodType === 'years' ? investmentPeriod * 12 : investmentPeriod;
  const monthlyRate = cagrRate / 100 / 12; // Convert annual rate to monthly

  let totalInvested = initialValue;
  let currentValue = initialValue;

  // Determine contribution frequency in months
  const contributionFrequencyMonths = stepUpFrequency === 'monthly' ? 1 : 12;

  // Calculate month by month
  for (let month = 1; month <= totalMonths; month++) {
    // Apply monthly growth to current value
    currentValue = currentValue * (1 + monthlyRate);

    // Add contribution based on frequency
    if (stepUpEnabled && month % contributionFrequencyMonths === 0 && month < totalMonths) {
      currentValue += stepUpAmount;
      totalInvested += stepUpAmount;
    }
  }

  // Add final contribution if applicable
  if (stepUpEnabled && totalMonths % contributionFrequencyMonths === 0) {
    totalInvested += stepUpAmount;
  }

  const finalValue = currentValue;
  const totalReturns = finalValue - totalInvested;

  // Calculate effective CAGR (annual rate)
  const years = totalMonths / 12;
  const effectiveCAGR = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;

  // Calculate total number of contributions
  let totalContributions = 0;
  if (stepUpEnabled) {
    totalContributions = Math.floor(totalMonths / contributionFrequencyMonths);
  }

  // Display results
  document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
  document.getElementById('totalReturns').textContent = formatCurrency(totalReturns);
  document.getElementById('finalValue').textContent = formatCurrency(finalValue);

  document.getElementById('detailInitial').textContent = formatCurrency(initialValue);
  document.getElementById('detailRate').textContent = cagrRate.toFixed(2) + '% per year';

  // Display period in both years and months if in months
  if (periodType === 'months') {
    const displayYears = Math.floor(totalMonths / 12);
    const displayMonths = totalMonths % 12;
    let periodText = '';
    if (displayYears > 0) {
      periodText += displayYears + (displayYears === 1 ? ' year' : ' years');
    }
    if (displayMonths > 0) {
      if (periodText) periodText += ', ';
      periodText += displayMonths + (displayMonths === 1 ? ' month' : ' months');
    }
    document.getElementById('detailYears').textContent = periodText;
  } else {
    document.getElementById('detailYears').textContent = investmentPeriod + (investmentPeriod === 1 ? ' year' : ' years');
  }

  document.getElementById('detailCAGR').textContent = effectiveCAGR.toFixed(2) + '%';

  if (stepUpEnabled) {
    document.getElementById('stepUpDetail').style.display = 'flex';
    const frequencyLabel = stepUpFrequency === 'monthly' ? '/month' : '/year';
    const contributionText = formatCurrency(stepUpAmount) + frequencyLabel +
                            ' (' + totalContributions + ' contribution' + (totalContributions !== 1 ? 's' : '') + ')';
    document.getElementById('detailStepUp').textContent = contributionText;
  } else {
    document.getElementById('stepUpDetail').style.display = 'none';
  }

  // Show results
  document.getElementById('cagrResults').style.display = 'block';

  // Scroll to results
  document.getElementById('cagrResults').scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

// ===== Life Insurance Calculator =====

// Show/hide conditional fields
const survivorPensionCheckbox = document.getElementById('survivorPension');
const inflationAdjustCheckbox = document.getElementById('inflationAdjust');

if (survivorPensionCheckbox) {
  survivorPensionCheckbox.addEventListener('change', () => {
    const group = document.getElementById('survivorPensionGroup');
    group.style.display = survivorPensionCheckbox.checked ? 'block' : 'none';
  });
}

if (inflationAdjustCheckbox) {
  inflationAdjustCheckbox.addEventListener('change', () => {
    const group = document.getElementById('inflationGroup');
    group.style.display = inflationAdjustCheckbox.checked ? 'block' : 'none';
  });
}

// Validate input field
function validateField(fieldId, fieldName) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + 'Error');
  const value = parseFloat(field.value);

  if (field.value === '' || isNaN(value) || value < 0) {
    errorSpan.textContent = `Please enter a valid non-negative number for ${fieldName}`;
    return false;
  }

  errorSpan.textContent = '';
  return true;
}

// Clear all error messages
function clearErrors() {
  document.querySelectorAll('.error-message').forEach(span => {
    span.textContent = '';
  });
}

// Calculate life insurance needs
function calculateLifeInsurance() {
  clearErrors();

  // Validate all fields
  const fields = [
    { id: 'mortgage', name: 'Mortgage Balance' },
    { id: 'debts', name: 'Other Debts' },
    { id: 'funeral', name: 'Funeral Expenses' },
    { id: 'annualIncome', name: 'Annual Income' },
    { id: 'replacementYears', name: 'Replacement Years' },
    { id: 'futureGoals', name: 'Future Goals' },
    { id: 'existingSavings', name: 'Existing Savings' },
    { id: 'existingInsurance', name: 'Existing Insurance' }
  ];

  const survivorPensionChecked = document.getElementById('survivorPension').checked;
  const inflationAdjustChecked = document.getElementById('inflationAdjust').checked;

  if (survivorPensionChecked) {
    fields.push({ id: 'survivorPensionAmount', name: 'Survivor Pension Amount' });
  }

  if (inflationAdjustChecked) {
    fields.push({ id: 'inflationRate', name: 'Inflation Rate' });
  }

  let isValid = true;
  fields.forEach(field => {
    if (!validateField(field.id, field.name)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  // Get all input values
  const mortgage = parseFloat(document.getElementById('mortgage').value) || 0;
  const debts = parseFloat(document.getElementById('debts').value) || 0;
  const funeral = parseFloat(document.getElementById('funeral').value) || 0;
  const annualIncome = parseFloat(document.getElementById('annualIncome').value) || 0;
  const replacementYears = parseFloat(document.getElementById('replacementYears').value) || 0;
  const futureGoals = parseFloat(document.getElementById('futureGoals').value) || 0;
  const existingSavings = parseFloat(document.getElementById('existingSavings').value) || 0;
  const existingInsurance = parseFloat(document.getElementById('existingInsurance').value) || 0;

  // Calculate immediate needs
  const immediateNeeds = mortgage + debts + funeral;

  // Calculate income replacement
  let incomeReplacement = annualIncome * replacementYears;
  let incomeReplacementDetails = `${formatCurrency(annualIncome)} × ${replacementYears} years`;

  // Subtract survivor pension if applicable
  if (survivorPensionChecked) {
    const survivorPensionAmount = parseFloat(document.getElementById('survivorPensionAmount').value) || 0;
    const totalSurvivorBenefit = survivorPensionAmount * replacementYears;
    incomeReplacement -= totalSurvivorBenefit;
    incomeReplacementDetails += ` - ${formatCurrency(survivorPensionAmount)}/year CPP (${formatCurrency(totalSurvivorBenefit)} total)`;
  }

  // Apply inflation adjustment if selected
  if (inflationAdjustChecked) {
    const inflationRate = parseFloat(document.getElementById('inflationRate').value) || 0;
    const inflationMultiplier = Math.pow(1 + (inflationRate / 100), replacementYears / 2); // Use midpoint
    incomeReplacement = incomeReplacement * inflationMultiplier;
    incomeReplacementDetails += ` × ${inflationMultiplier.toFixed(2)} (inflation adjusted at ${inflationRate}%)`;
  }

  // Ensure income replacement is not negative
  incomeReplacement = Math.max(0, incomeReplacement);

  // Calculate subtotal
  const subtotal = immediateNeeds + incomeReplacement + futureGoals;

  // Calculate recommended coverage
  const existingResources = existingSavings + existingInsurance;
  const recommendedCoverage = Math.max(0, subtotal - existingResources);

  // Display results
  document.getElementById('resultImmediateNeeds').textContent = formatCurrency(immediateNeeds);
  document.getElementById('immediateNeedsDetail').innerHTML =
    `<small>Mortgage: ${formatCurrency(mortgage)} + Debts: ${formatCurrency(debts)} + Funeral: ${formatCurrency(funeral)}</small>`;

  document.getElementById('resultIncomeReplacement').textContent = formatCurrency(incomeReplacement);
  document.getElementById('incomeReplacementDetail').innerHTML =
    `<small>${incomeReplacementDetails}</small>`;

  document.getElementById('resultFutureGoals').textContent = formatCurrency(futureGoals);

  document.getElementById('resultSubtotal').textContent = formatCurrency(subtotal);

  document.getElementById('resultExistingSavings').textContent = '-' + formatCurrency(existingSavings);
  document.getElementById('resultExistingInsurance').textContent = '-' + formatCurrency(existingInsurance);

  document.getElementById('resultRecommended').textContent = formatCurrency(recommendedCoverage);

  // Generate policy suggestions (rounded to $100k increments)
  const policySuggestionsDiv = document.getElementById('policySuggestions');
  if (recommendedCoverage > 0) {
    const roundedUp = Math.ceil(recommendedCoverage / 100000) * 100000;
    const roundedDown = Math.floor(recommendedCoverage / 100000) * 100000;
    const roundedNearest = Math.round(recommendedCoverage / 100000) * 100000;

    let suggestions = '<div class="policy-suggestion-box">';
    suggestions += '<h4>Suggested Policy Sizes:</h4>';
    suggestions += '<ul>';

    if (roundedNearest > 0) {
      suggestions += `<li><strong>${formatCurrency(roundedNearest)}</strong> (rounded to nearest $100k)</li>`;
    }

    if (roundedUp !== roundedNearest && roundedUp > 0) {
      suggestions += `<li>${formatCurrency(roundedUp)} (for additional cushion)</li>`;
    }

    if (roundedDown !== roundedNearest && roundedDown > 0) {
      suggestions += `<li>${formatCurrency(roundedDown)} (budget-conscious option)</li>`;
    }

    suggestions += '</ul>';
    suggestions += '<p class="suggestion-note">Choose a coverage amount that balances your family\'s needs with your budget. Term life insurance is often the most affordable option for temporary needs.</p>';
    suggestions += '</div>';

    policySuggestionsDiv.innerHTML = suggestions;
  } else {
    policySuggestionsDiv.innerHTML = '<div class="policy-suggestion-box"><p class="suggestion-note">Based on your inputs, your existing resources fully cover your needs. However, consider keeping some life insurance for unexpected expenses or future goals.</p></div>';
  }

  // Show results section
  document.getElementById('lifeInsuranceResults').style.display = 'block';

  // Scroll to results
  document.getElementById('lifeInsuranceResults').scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

// Reset form
function resetLifeInsuranceForm() {
  document.getElementById('lifeInsuranceForm').reset();
  document.getElementById('lifeInsuranceResults').style.display = 'none';
  document.getElementById('survivorPensionGroup').style.display = 'none';
  document.getElementById('inflationGroup').style.display = 'none';
  clearErrors();

  // Reset to default values
  document.getElementById('funeral').value = 15000;
  document.getElementById('replacementYears').value = 15;
  document.getElementById('survivorPensionAmount').value = 7500;
  document.getElementById('inflationRate').value = 2.0;
}
