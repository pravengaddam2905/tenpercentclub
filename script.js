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

// ===== FIRE Calculator =====

// Password protection for FIRE calculator
function unlockFIRECalculator() {
  const password = document.getElementById('firePassword').value;
  const correctPassword = 'FIRE2025'; // Change this to your desired password

  if (password === correctPassword) {
    document.getElementById('firePasswordPrompt').style.display = 'none';
    document.getElementById('fireCalculatorContent').style.display = 'block';
    document.getElementById('firePasswordError').style.display = 'none';
    // Store unlock status in session storage so it persists during the session
    sessionStorage.setItem('fireUnlocked', 'true');
  } else {
    document.getElementById('firePasswordError').style.display = 'block';
    document.getElementById('firePassword').value = '';
  }
}

// Check if already unlocked in this session
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('fireUnlocked') === 'true') {
    const passwordPrompt = document.getElementById('firePasswordPrompt');
    const calculatorContent = document.getElementById('fireCalculatorContent');
    if (passwordPrompt && calculatorContent) {
      passwordPrompt.style.display = 'none';
      calculatorContent.style.display = 'block';
    }
  }
});

// Allow Enter key to submit password
const firePasswordInput = document.getElementById('firePassword');
if (firePasswordInput) {
  firePasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      unlockFIRECalculator();
    }
  });
}

// Show/hide conditional fields for FIRE calculator
const fireIncludeCPP = document.getElementById('fireIncludeCPP');
const fireIncludeOAS = document.getElementById('fireIncludeOAS');
const fireIncludePension = document.getElementById('fireIncludePension');
const fireHasEducation = document.getElementById('fireHasEducation');
const fireHasWedding = document.getElementById('fireHasWedding');
const fireHasVacation = document.getElementById('fireHasVacation');

if (fireIncludeCPP) {
  fireIncludeCPP.addEventListener('change', () => {
    const group = document.getElementById('fireCPPGroup');
    group.style.display = fireIncludeCPP.checked ? 'block' : 'none';
  });
}

if (fireIncludeOAS) {
  fireIncludeOAS.addEventListener('change', () => {
    const group = document.getElementById('fireOASGroup');
    group.style.display = fireIncludeOAS.checked ? 'block' : 'none';
  });
}

if (fireIncludePension) {
  fireIncludePension.addEventListener('change', () => {
    const group = document.getElementById('firePensionGroup');
    group.style.display = fireIncludePension.checked ? 'block' : 'none';
  });
}

if (fireHasEducation) {
  fireHasEducation.addEventListener('change', () => {
    const group = document.getElementById('fireEducationGroup');
    group.style.display = fireHasEducation.checked ? 'block' : 'none';
  });
}

if (fireHasWedding) {
  fireHasWedding.addEventListener('change', () => {
    const group = document.getElementById('fireWeddingGroup');
    group.style.display = fireHasWedding.checked ? 'block' : 'none';
  });
}

if (fireHasVacation) {
  fireHasVacation.addEventListener('change', () => {
    const group = document.getElementById('fireVacationGroup');
    group.style.display = fireHasVacation.checked ? 'block' : 'none';
  });
}

// Calculate FIRE number and projections
function calculateFIRE() {
  // Get all input values
  const currentAge = parseFloat(document.getElementById('fireCurrentAge').value);
  const retirementAge = parseFloat(document.getElementById('fireRetirementAge').value);
  const annualIncome = parseFloat(document.getElementById('fireAnnualIncome').value) || 0;
  const annualExpenses = parseFloat(document.getElementById('fireAnnualExpenses').value) || 0;
  const annualSavings = parseFloat(document.getElementById('fireAnnualSavings').value) || 0;
  const currentAssets = parseFloat(document.getElementById('fireCurrentAssets').value) || 0;
  const retirementIncome = parseFloat(document.getElementById('fireRetirementIncome').value) || 0;

  // Debts and obligations
  const mortgages = parseFloat(document.getElementById('fireMortgages').value) || 0;
  const debts = parseFloat(document.getElementById('fireDebts').value) || 0;
  const monthlyEMI = parseFloat(document.getElementById('fireMonthlyEMI').value) || 0;

  const includeCPP = document.getElementById('fireIncludeCPP').checked;
  const cppAmount = includeCPP ? parseFloat(document.getElementById('fireCPPAmount').value) || 0 : 0;

  const includeOAS = document.getElementById('fireIncludeOAS').checked;
  const oasAmount = includeOAS ? parseFloat(document.getElementById('fireOASAmount').value) || 0 : 0;

  const includePension = document.getElementById('fireIncludePension').checked;
  const pensionAmount = includePension ? parseFloat(document.getElementById('firePensionAmount').value) || 0 : 0;

  const hasEducation = document.getElementById('fireHasEducation').checked;
  const educationAmount = hasEducation ? parseFloat(document.getElementById('fireEducationAmount').value) || 0 : 0;
  const educationYear = hasEducation ? parseFloat(document.getElementById('fireEducationYear').value) || 0 : 0;

  const hasWedding = document.getElementById('fireHasWedding').checked;
  const weddingAmount = hasWedding ? parseFloat(document.getElementById('fireWeddingAmount').value) || 0 : 0;
  const weddingYear = hasWedding ? parseFloat(document.getElementById('fireWeddingYear').value) || 0 : 0;

  const hasVacation = document.getElementById('fireHasVacation').checked;
  const vacationAmount = hasVacation ? parseFloat(document.getElementById('fireVacationAmount').value) || 0 : 0;
  const vacationFrequency = hasVacation ? parseFloat(document.getElementById('fireVacationFrequency').value) || 1 : 1;

  const emergencyMonths = parseFloat(document.getElementById('fireEmergencyMonths').value) || 0;

  // Assumptions
  const preReturnRate = parseFloat(document.getElementById('firePreReturnRate').value) / 100 || 0.06;
  const postReturnRate = parseFloat(document.getElementById('firePostReturnRate').value) / 100 || 0.04;
  const inflationRate = parseFloat(document.getElementById('fireInflationRate').value) / 100 || 0.02;
  const incomeGrowthRate = parseFloat(document.getElementById('fireIncomeGrowth').value) / 100 || 0.02;
  const withdrawalRate = parseFloat(document.getElementById('fireWithdrawalRate').value) / 100 || 0.035;

  // Validation
  if (currentAge >= retirementAge) {
    alert('Target FIRE age must be greater than current age');
    return;
  }

  if (retirementIncome <= 0 && annualExpenses <= 0) {
    alert('Please enter either desired retirement income or current annual expenses');
    return;
  }

  // Calculate years until retirement
  const yearsToRetirement = retirementAge - currentAge;

  // Use retirement income if provided, otherwise use current expenses
  let desiredRetirementIncome = retirementIncome > 0 ? retirementIncome : annualExpenses;

  // Adjust for inflation to get future value
  const futureRetirementIncome = desiredRetirementIncome * Math.pow(1 + inflationRate, yearsToRetirement);

  // Calculate net retirement income needed (after government benefits)
  const totalGovernmentBenefits = cppAmount + oasAmount + pensionAmount;
  const netRetirementIncome = Math.max(0, futureRetirementIncome - totalGovernmentBenefits);

  // Calculate FIRE number using safe withdrawal rate
  const fireNumberBase = netRetirementIncome / withdrawalRate;

  // Add total debts that need to be paid off before FIRE
  const totalDebts = mortgages + debts;
  const fireNumber = fireNumberBase + totalDebts;

  // Calculate emergency fund target
  const emergencyFund = (annualExpenses / 12) * emergencyMonths;

  // Project portfolio growth
  let portfolioValue = currentAssets;
  let totalContributions = currentAssets;
  let yearByYearProjection = [];

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Apply investment return
    portfolioValue *= (1 + preReturnRate);

    // Add annual savings (adjusted for income growth)
    const yearSavings = annualSavings * Math.pow(1 + incomeGrowthRate, year - 1);
    portfolioValue += yearSavings;
    totalContributions += yearSavings;

    yearByYearProjection.push({
      year: currentAge + year,
      value: portfolioValue
    });
  }

  const projectedPortfolio = portfolioValue;

  // Calculate gap
  const gap = fireNumber - projectedPortfolio;
  const willReachFIRE = gap <= 0;

  // Calculate monthly savings needed if there's a gap
  let extraMonthlySavings = 0;
  if (!willReachFIRE) {
    // Future value of annuity formula: FV = PMT * (((1 + r)^n - 1) / r)
    // Solving for PMT: PMT = FV / (((1 + r)^n - 1) / r)
    const monthlyRate = preReturnRate / 12;
    const months = yearsToRetirement * 12;
    const fvFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    extraMonthlySavings = gap / fvFactor;
  }

  // Calculate actual FIRE age if continuing with current savings
  let actualFIREAge = retirementAge;
  if (!willReachFIRE) {
    let testPortfolio = currentAssets;
    let testAge = currentAge;

    while (testPortfolio < fireNumber && testAge < 100) {
      testAge++;
      testPortfolio *= (1 + preReturnRate);
      const yearSavings = annualSavings * Math.pow(1 + incomeGrowthRate, testAge - currentAge - 1);
      testPortfolio += yearSavings;
    }

    actualFIREAge = testAge;
  }

  // Calculate monthly savings for individual goals
  const monthlySavingsBreakdown = [];

  // Debt payoff (current EMI payments)
  if (monthlyEMI > 0) {
    monthlySavingsBreakdown.push({
      goal: 'Debt Payments (EMI)',
      target: totalDebts,
      monthly: monthlyEMI
    });
  }

  // Emergency fund
  if (emergencyFund > 0) {
    const emergencyMonthly = emergencyFund / (yearsToRetirement * 12);
    monthlySavingsBreakdown.push({
      goal: 'Emergency Fund',
      target: emergencyFund,
      monthly: emergencyMonthly
    });
  }

  // Education goal
  if (hasEducation && educationAmount > 0) {
    const yearsToEducation = Math.max(1, educationYear - currentAge);
    const monthlyRate = preReturnRate / 12;
    const months = yearsToEducation * 12;
    const fvFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    const educationMonthly = educationAmount / fvFactor;
    monthlySavingsBreakdown.push({
      goal: `Education (in ${yearsToEducation} years)`,
      target: educationAmount,
      monthly: educationMonthly
    });
  }

  // Wedding goal
  if (hasWedding && weddingAmount > 0) {
    const yearsToWedding = Math.max(1, weddingYear - currentAge);
    const monthlyRate = preReturnRate / 12;
    const months = yearsToWedding * 12;
    const fvFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    const weddingMonthly = weddingAmount / fvFactor;
    monthlySavingsBreakdown.push({
      goal: `Wedding (in ${yearsToWedding} years)`,
      target: weddingAmount,
      monthly: weddingMonthly
    });
  }

  // Vacation goal
  if (hasVacation && vacationAmount > 0) {
    const vacationsPerYear = 1 / vacationFrequency;
    const totalVacations = yearsToRetirement * vacationsPerYear;
    const totalVacationCost = vacationAmount * totalVacations;
    const vacationMonthly = totalVacationCost / (yearsToRetirement * 12);
    monthlySavingsBreakdown.push({
      goal: `Vacations (every ${vacationFrequency} year${vacationFrequency > 1 ? 's' : ''})`,
      target: totalVacationCost,
      monthly: vacationMonthly
    });
  }

  // Display results
  displayFIREResults(
    fireNumber,
    projectedPortfolio,
    willReachFIRE,
    gap,
    extraMonthlySavings,
    actualFIREAge,
    annualSavings,
    annualIncome,
    monthlySavingsBreakdown,
    currentAge,
    retirementAge,
    desiredRetirementIncome,
    futureRetirementIncome,
    totalGovernmentBenefits,
    withdrawalRate,
    inflationRate,
    preReturnRate,
    yearByYearProjection,
    annualExpenses,
    currentAssets,
    totalDebts
  );
}

function displayFIREResults(
  fireNumber,
  projectedPortfolio,
  willReachFIRE,
  gap,
  extraMonthlySavings,
  actualFIREAge,
  annualSavings,
  annualIncome,
  monthlySavingsBreakdown,
  currentAge,
  retirementAge,
  desiredRetirementIncome,
  futureRetirementIncome,
  totalGovernmentBenefits,
  withdrawalRate,
  inflationRate,
  preReturnRate,
  yearByYearProjection,
  annualExpenses,
  currentAssets,
  totalDebts
) {
  // Update FIRE number
  document.getElementById('fireNumber').textContent = formatCurrency(fireNumber);

  // Update projected portfolio
  document.getElementById('fireProjectedPortfolio').textContent = formatCurrency(projectedPortfolio);

  // Update savings rate
  const savingsRate = annualIncome > 0 ? (annualSavings / annualIncome * 100).toFixed(1) : 0;
  document.getElementById('fireSavingsRate').textContent = savingsRate + '%';

  // Update status
  const statusElement = document.getElementById('fireStatus');
  const statusMessageElement = document.getElementById('fireStatusMessage');

  if (willReachFIRE) {
    statusElement.className = 'fire-status success';
    statusElement.textContent = '✓ On Track to FIRE!';
    statusMessageElement.textContent = `You're projected to reach financial independence by age ${retirementAge}. Keep up the great work!`;
  } else {
    statusElement.className = 'fire-status warning';
    statusElement.textContent = '⚠ Adjustment Needed';
    statusMessageElement.textContent = `You're ${formatCurrency(Math.abs(gap))} short of your FIRE goal. See recommendations below.`;
  }

  // Update gap analysis
  if (willReachFIRE) {
    document.getElementById('fireGapAmount').textContent = formatCurrency(0);
    document.getElementById('fireExtraSavings').textContent = formatCurrency(0);
    document.getElementById('fireActualAge').textContent = retirementAge + ' years';
  } else {
    document.getElementById('fireGapAmount').textContent = formatCurrency(Math.abs(gap));
    document.getElementById('fireExtraSavings').textContent = formatCurrency(extraMonthlySavings);
    document.getElementById('fireActualAge').textContent = actualFIREAge >= 100 ? 'Not achievable' : actualFIREAge + ' years';
  }

  // Update breakdown
  const breakdownGrid = document.getElementById('fireBreakdownGrid');
  breakdownGrid.innerHTML = '';

  if (monthlySavingsBreakdown.length > 0) {
    monthlySavingsBreakdown.forEach(item => {
      const div = document.createElement('div');
      div.className = 'fire-breakdown-item';
      div.innerHTML = `
        <div class="fire-breakdown-label">${item.goal}</div>
        <div class="fire-breakdown-value">${formatCurrency(item.monthly)}/month</div>
        <div class="fire-breakdown-target">Target: ${formatCurrency(item.target)}</div>
      `;
      breakdownGrid.appendChild(div);
    });
  } else {
    breakdownGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">No specific goals set</p>';
  }

  // Update recommendations
  const recommendationsDiv = document.getElementById('fireRecommendations');
  let recommendations = '<ul>';

  if (willReachFIRE) {
    recommendations += '<li>You\'re on track! Consider increasing your emergency fund or adding new financial goals.</li>';
    recommendations += '<li>Review your investment allocation to ensure it matches your risk tolerance and timeline.</li>';
    recommendations += '<li>Consider tax-efficient withdrawal strategies for retirement (TFSA first, then non-registered, then RRSP).</li>';
  } else {
    recommendations += `<li><strong>Increase monthly savings by ${formatCurrency(extraMonthlySavings)}</strong> to reach FIRE by age ${retirementAge}.</li>`;
    recommendations += '<li>Look for ways to reduce current expenses to free up more savings.</li>';
    recommendations += '<li>Consider side income opportunities or career advancement to increase earning potential.</li>';
    recommendations += '<li>Review and optimize your investment returns - even a 1% increase can make a big difference over time.</li>';

    if (actualFIREAge < 100) {
      recommendations += `<li>Alternative: Continue with current savings plan and reach FIRE at age ${actualFIREAge} (${actualFIREAge - retirementAge} years later).</li>`;
    }
  }

  recommendations += '<li>Maximize tax-advantaged accounts (RRSP, TFSA, FHSA if first-time homebuyer).</li>';
  recommendations += '<li>Book a free consultation to create a personalized FIRE strategy tailored to your situation.</li>';
  recommendations += '</ul>';

  recommendationsDiv.innerHTML = recommendations;

  // Update assumptions summary
  document.getElementById('fireAssumptionIncome').textContent = formatCurrency(desiredRetirementIncome) + '/year (today\'s dollars)';
  document.getElementById('fireAssumptionInflation').textContent = (inflationRate * 100).toFixed(1) + '%';
  document.getElementById('fireAssumptionReturn').textContent = (preReturnRate * 100).toFixed(1) + '%';
  document.getElementById('fireAssumptionWithdrawal').textContent = (withdrawalRate * 100).toFixed(2) + '%';

  if (totalGovernmentBenefits > 0) {
    document.getElementById('fireAssumptionBenefits').textContent = formatCurrency(totalGovernmentBenefits) + '/year';
  } else {
    document.getElementById('fireAssumptionBenefits').textContent = 'Not included';
  }

  // Update total debts
  if (totalDebts > 0) {
    document.getElementById('fireAssumptionDebts').textContent = formatCurrency(totalDebts);
  } else {
    document.getElementById('fireAssumptionDebts').textContent = 'None';
  }

  // Render visual charts
  renderFIRECharts(
    yearByYearProjection,
    fireNumber,
    currentAssets,
    annualIncome,
    annualExpenses,
    annualSavings,
    monthlySavingsBreakdown,
    projectedPortfolio,
    currentAge,
    retirementAge
  );

  // Show results
  document.getElementById('fireResults').style.display = 'block';

  // Scroll to results
  document.getElementById('fireResults').scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

function resetFIREForm() {
  document.getElementById('fireForm').reset();
  document.getElementById('fireResults').style.display = 'none';

  // Hide conditional groups
  document.getElementById('fireCPPGroup').style.display = 'none';
  document.getElementById('fireOASGroup').style.display = 'none';
  document.getElementById('firePensionGroup').style.display = 'none';
  document.getElementById('fireEducationGroup').style.display = 'none';
  document.getElementById('fireWeddingGroup').style.display = 'none';
  document.getElementById('fireVacationGroup').style.display = 'none';

  // Reset to default values
  document.getElementById('fireCurrentAge').value = 30;
  document.getElementById('fireRetirementAge').value = 50;
  document.getElementById('fireAnnualIncome').value = 80000;
  document.getElementById('fireAnnualExpenses').value = 50000;
  document.getElementById('fireAnnualSavings').value = 15000;
  document.getElementById('fireCurrentAssets').value = 50000;
  document.getElementById('fireMortgages').value = 0;
  document.getElementById('fireDebts').value = 0;
  document.getElementById('fireMonthlyEMI').value = 0;
  document.getElementById('fireRetirementIncome').value = 40000;
  document.getElementById('fireCPPAmount').value = 15000;
  document.getElementById('fireOASAmount').value = 8000;
  document.getElementById('firePensionAmount').value = 20000;
  document.getElementById('fireEmergencyMonths').value = 6;
  document.getElementById('firePreReturnRate').value = 6;
  document.getElementById('firePostReturnRate').value = 4;
  document.getElementById('fireInflationRate').value = 2;
  document.getElementById('fireIncomeGrowth').value = 2;
  document.getElementById('fireWithdrawalRate').value = 3.5;

  // Destroy existing charts if they exist
  destroyFIRECharts();
}

// Store chart instances globally to manage them
let fireCharts = {
  portfolioGrowth: null,
  incomeExpense: null,
  fireProgress: null,
  savingsBreakdown: null
};

function destroyFIRECharts() {
  Object.keys(fireCharts).forEach(key => {
    if (fireCharts[key]) {
      fireCharts[key].destroy();
      fireCharts[key] = null;
    }
  });
}

function renderFIRECharts(
  yearByYearProjection,
  fireNumber,
  currentAssets,
  annualIncome,
  annualExpenses,
  annualSavings,
  monthlySavingsBreakdown,
  projectedPortfolio,
  currentAge,
  retirementAge
) {
  // Destroy existing charts before creating new ones
  destroyFIRECharts();

  // 1. Portfolio Growth Projection Chart
  const portfolioCtx = document.getElementById('portfolioGrowthChart').getContext('2d');

  const years = [currentAge, ...yearByYearProjection.map(p => p.year)];
  const portfolioValues = [currentAssets, ...yearByYearProjection.map(p => p.value)];
  const fireLineValues = years.map(() => fireNumber);

  fireCharts.portfolioGrowth = new Chart(portfolioCtx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Projected Portfolio Value',
          data: portfolioValues,
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6
        },
        {
          label: 'FIRE Number Target',
          data: fireLineValues,
          borderColor: '#d97706',
          backgroundColor: 'transparent',
          borderDash: [10, 5],
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + (value / 1000) + 'k';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Age',
            font: { size: 12, weight: 'bold' }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  // 2. Income vs Expenses Pie Chart
  const incomeExpenseCtx = document.getElementById('incomeExpenseChart').getContext('2d');

  fireCharts.incomeExpense = new Chart(incomeExpenseCtx, {
    type: 'doughnut',
    data: {
      labels: ['Savings', 'Expenses'],
      datasets: [{
        data: [annualSavings, annualExpenses],
        backgroundColor: [
          '#0891b2',
          '#f59e0b'
        ],
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
          labels: {
            padding: 15,
            usePointStyle: true,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = ((value / annualIncome) * 100).toFixed(1);
              return label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
            }
          }
        }
      }
    }
  });

  // 3. FIRE Progress Gauge (Doughnut)
  const fireProgressCtx = document.getElementById('fireProgressChart').getContext('2d');

  const progressPercentage = Math.min(100, (projectedPortfolio / fireNumber) * 100);
  const remainingPercentage = Math.max(0, 100 - progressPercentage);

  fireCharts.fireProgress = new Chart(fireProgressCtx, {
    type: 'doughnut',
    data: {
      labels: ['Progress to FIRE', 'Remaining'],
      datasets: [{
        data: [progressPercentage, remainingPercentage],
        backgroundColor: [
          progressPercentage >= 100 ? '#10b981' : '#0891b2',
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
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) {
                return 'Progress: ' + progressPercentage.toFixed(1) + '%';
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
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();

        const centerX = width / 2;
        const centerY = height * 0.85;

        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = progressPercentage >= 100 ? '#10b981' : '#0891b2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(progressPercentage.toFixed(0) + '%', centerX, centerY);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('to FIRE Goal', centerX, centerY + 25);

        ctx.restore();
      }
    }]
  });

  // 4. Savings Breakdown Bar Chart
  const savingsBreakdownCtx = document.getElementById('savingsBreakdownChart').getContext('2d');

  if (monthlySavingsBreakdown.length > 0) {
    const labels = monthlySavingsBreakdown.map(item => item.goal);
    const monthlyAmounts = monthlySavingsBreakdown.map(item => item.monthly);

    fireCharts.savingsBreakdown = new Chart(savingsBreakdownCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Savings',
          data: monthlyAmounts,
          backgroundColor: '#0891b2',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'Monthly: ' + formatCurrency(context.parsed.x);
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  } else {
    // Display message if no goals
    const canvas = document.getElementById('savingsBreakdownChart');
    const ctx = canvas.getContext('2d');
    ctx.font = '16px Arial';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('No specific savings goals set', canvas.width / 2, canvas.height / 2);
  }
}

// ===== Financial Needs Analysis (FNA) Tool =====

let fnaCurrentStep = 1;
let fnaData = {};

// Show/hide spouse info
const fnaMarriedCheckbox = document.getElementById('fnaMarried');
if (fnaMarriedCheckbox) {
  fnaMarriedCheckbox.addEventListener('change', () => {
    document.getElementById('fnaSpouseInfo').style.display = fnaMarriedCheckbox.checked ? 'block' : 'none';
  });
}

// Show/hide insurance details
const fnaHasLifeInsurance = document.getElementById('fnaHasLifeInsurance');
if (fnaHasLifeInsurance) {
  fnaHasLifeInsurance.addEventListener('change', () => {
    document.getElementById('fnaLifeInsuranceDetails').style.display = fnaHasLifeInsurance.checked ? 'block' : 'none';
  });
}

const fnaHasCriticalIllness = document.getElementById('fnaHasCriticalIllness');
if (fnaHasCriticalIllness) {
  fnaHasCriticalIllness.addEventListener('change', () => {
    document.getElementById('fnaCriticalIllnessDetails').style.display = fnaHasCriticalIllness.checked ? 'block' : 'none';
  });
}

const fnaHasDisability = document.getElementById('fnaHasDisability');
if (fnaHasDisability) {
  fnaHasDisability.addEventListener('change', () => {
    document.getElementById('fnaDisabilityDetails').style.display = fnaHasDisability.checked ? 'block' : 'none';
  });
}

// Real-time calculations for Step 2 (Income & Expenses)
function updateFNAIncomeExpenses() {
  const income1 = parseFloat(document.getElementById('fnaIncome1')?.value) || 0;
  const income2 = parseFloat(document.getElementById('fnaIncome2')?.value) || 0;
  const otherIncome = parseFloat(document.getElementById('fnaOtherIncome')?.value) || 0;

  const totalIncome = income1 + income2 + otherIncome;
  document.getElementById('fnaTotalIncome').textContent = formatCurrency(totalIncome);

  const housing = parseFloat(document.getElementById('fnaExpensesHousing')?.value) || 0;
  const food = parseFloat(document.getElementById('fnaExpensesFood')?.value) || 0;
  const transport = parseFloat(document.getElementById('fnaExpensesTransport')?.value) || 0;
  const insurance = parseFloat(document.getElementById('fnaExpensesInsurance')?.value) || 0;
  const debt = parseFloat(document.getElementById('fnaExpensesDebt')?.value) || 0;
  const other = parseFloat(document.getElementById('fnaExpensesOther')?.value) || 0;

  const totalExpenses = housing + food + transport + insurance + debt + other;
  document.getElementById('fnaTotalExpenses').textContent = formatCurrency(totalExpenses);

  const surplus = totalIncome - totalExpenses;
  const surplusElement = document.getElementById('fnaMonthlySurplus');
  surplusElement.textContent = formatCurrency(surplus);
  surplusElement.style.color = surplus >= 0 ? '#10b981' : '#ef4444';
}

// Real-time calculations for Step 4 (Assets & Debts)
function updateFNAAssetsDebts() {
  const cash = parseFloat(document.getElementById('fnaAssetsCash')?.value) || 0;
  const rrsp = parseFloat(document.getElementById('fnaAssetsRRSP')?.value) || 0;
  const tfsa = parseFloat(document.getElementById('fnaAssetsTFSA')?.value) || 0;
  const resp = parseFloat(document.getElementById('fnaAssetsRESP')?.value) || 0;
  const investments = parseFloat(document.getElementById('fnaAssetsInvestments')?.value) || 0;
  const home = parseFloat(document.getElementById('fnaAssetsHome')?.value) || 0;
  const otherAssets = parseFloat(document.getElementById('fnaAssetsOther')?.value) || 0;

  const totalAssets = cash + rrsp + tfsa + resp + investments + home + otherAssets;
  document.getElementById('fnaTotalAssets').textContent = formatCurrency(totalAssets);

  const mortgage = parseFloat(document.getElementById('fnaDebtMortgage')?.value) || 0;
  const credit = parseFloat(document.getElementById('fnaDebtCredit')?.value) || 0;
  const car = parseFloat(document.getElementById('fnaDebtCar')?.value) || 0;
  const student = parseFloat(document.getElementById('fnaDebtStudent')?.value) || 0;
  const otherDebts = parseFloat(document.getElementById('fnaDebtOther')?.value) || 0;

  const totalDebts = mortgage + credit + car + student + otherDebts;
  document.getElementById('fnaTotalDebts').textContent = formatCurrency(totalDebts);

  const netWorth = totalAssets - totalDebts;
  const netWorthElement = document.getElementById('fnaNetWorth');
  netWorthElement.textContent = formatCurrency(netWorth);
  netWorthElement.style.color = netWorth >= 0 ? '#10b981' : '#ef4444';
}

// Add event listeners for real-time updates
document.addEventListener('DOMContentLoaded', () => {
  // Income & Expenses
  ['fnaIncome1', 'fnaIncome2', 'fnaOtherIncome', 'fnaExpensesHousing', 'fnaExpensesFood',
   'fnaExpensesTransport', 'fnaExpensesInsurance', 'fnaExpensesDebt', 'fnaExpensesOther'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updateFNAIncomeExpenses);
    }
  });

  // Assets & Debts
  ['fnaAssetsCash', 'fnaAssetsRRSP', 'fnaAssetsTFSA', 'fnaAssetsRESP', 'fnaAssetsInvestments',
   'fnaAssetsHome', 'fnaAssetsOther', 'fnaDebtMortgage', 'fnaDebtCredit', 'fnaDebtCar',
   'fnaDebtStudent', 'fnaDebtOther'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updateFNAAssetsDebts);
    }
  });
});

// Navigation functions
function nextFNAStep(step) {
  // Hide current step
  document.getElementById('fnaStep' + fnaCurrentStep).classList.remove('active');

  // Show next step
  document.getElementById('fnaStep' + step).classList.add('active');

  // Update progress bar
  const progress = ((step - 1) / 5) * 100;
  document.getElementById('fnaProgressFill').style.width = progress + '%';

  // Update step indicators
  document.querySelectorAll('.fna-step').forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index + 1 < step) {
      stepEl.classList.add('completed');
    } else if (index + 1 === step) {
      stepEl.classList.add('active');
    }
  });

  fnaCurrentStep = step;

  // Scroll to top
  document.querySelector('#fna-tool').scrollIntoView({ behavior: 'smooth' });
}

function prevFNAStep(step) {
  nextFNAStep(step);
}

// Calculate FNA function
function calculateFNA() {
  // Collect all data
  fnaData = {
    // Personal Info
    firstName: document.getElementById('fnaFirstName').value,
    lastName: document.getElementById('fnaLastName').value,
    dob: document.getElementById('fnaDOB').value,
    phone: document.getElementById('fnaPhone').value,
    married: document.getElementById('fnaMarried').checked,
    spouseName: document.getElementById('fnaSpouseName').value,
    spouseDOB: document.getElementById('fnaSpouseDOB').value,
    dependents: parseInt(document.getElementById('fnaDependents').value) || 0,
    description: document.getElementById('fnaDescription').value,

    // Income & Expenses
    income1: parseFloat(document.getElementById('fnaIncome1').value) || 0,
    income2: parseFloat(document.getElementById('fnaIncome2').value) || 0,
    otherIncome: parseFloat(document.getElementById('fnaOtherIncome').value) || 0,
    expensesHousing: parseFloat(document.getElementById('fnaExpensesHousing').value) || 0,
    expensesFood: parseFloat(document.getElementById('fnaExpensesFood').value) || 0,
    expensesTransport: parseFloat(document.getElementById('fnaExpensesTransport').value) || 0,
    expensesInsurance: parseFloat(document.getElementById('fnaExpensesInsurance').value) || 0,
    expensesDebt: parseFloat(document.getElementById('fnaExpensesDebt').value) || 0,
    expensesOther: parseFloat(document.getElementById('fnaExpensesOther').value) || 0,
    taxRate: parseFloat(document.getElementById('fnaTaxRate').value) || 30,

    // Goals
    goals: {
      retirement: document.getElementById('goalRetirement').checked,
      protection: document.getElementById('goalProtection').checked,
      emergency: document.getElementById('goalEmergency').checked,
      home: document.getElementById('goalHome').checked,
      education: document.getElementById('goalEducation').checked,
      debt: document.getElementById('goalDebt').checked,
      tax: document.getElementById('goalTax').checked,
      business: document.getElementById('goalBusiness').checked
    },

    // Assets
    assetsCash: parseFloat(document.getElementById('fnaAssetsCash').value) || 0,
    assetsRRSP: parseFloat(document.getElementById('fnaAssetsRRSP').value) || 0,
    assetsTFSA: parseFloat(document.getElementById('fnaAssetsTFSA').value) || 0,
    assetsRESP: parseFloat(document.getElementById('fnaAssetsRESP').value) || 0,
    assetsInvestments: parseFloat(document.getElementById('fnaAssetsInvestments').value) || 0,
    assetsHome: parseFloat(document.getElementById('fnaAssetsHome').value) || 0,
    assetsOther: parseFloat(document.getElementById('fnaAssetsOther').value) || 0,

    // Debts
    debtMortgage: parseFloat(document.getElementById('fnaDebtMortgage').value) || 0,
    debtCredit: parseFloat(document.getElementById('fnaDebtCredit').value) || 0,
    debtCar: parseFloat(document.getElementById('fnaDebtCar').value) || 0,
    debtStudent: parseFloat(document.getElementById('fnaDebtStudent').value) || 0,
    debtOther: parseFloat(document.getElementById('fnaDebtOther').value) || 0,

    // Protection
    hasLifeInsurance: document.getElementById('fnaHasLifeInsurance').checked,
    lifeCoverageYou: parseFloat(document.getElementById('fnaLifeCoverageYou').value) || 0,
    lifeCoverageSpouse: parseFloat(document.getElementById('fnaLifeCoverageSpouse').value) || 0,
    lifeType: document.getElementById('fnaLifeType').value,
    hasCriticalIllness: document.getElementById('fnaHasCriticalIllness').checked,
    criticalCoverage: parseFloat(document.getElementById('fnaCriticalCoverage').value) || 0,
    hasDisability: document.getElementById('fnaHasDisability').checked,
    disabilityMonthly: parseFloat(document.getElementById('fnaDisabilityMonthly').value) || 0,
    hasHealth: document.getElementById('fnaHasHealth').checked
  };

  // Calculate key metrics
  const totalIncome = fnaData.income1 + fnaData.income2 + fnaData.otherIncome;
  const totalExpenses = fnaData.expensesHousing + fnaData.expensesFood + fnaData.expensesTransport +
                       fnaData.expensesInsurance + fnaData.expensesDebt + fnaData.expensesOther;
  const monthlyCashFlow = totalIncome - totalExpenses;

  const totalAssets = fnaData.assetsCash + fnaData.assetsRRSP + fnaData.assetsTFSA +
                      fnaData.assetsRESP + fnaData.assetsInvestments + fnaData.assetsHome +
                      fnaData.assetsOther;
  const totalDebts = fnaData.debtMortgage + fnaData.debtCredit + fnaData.debtCar +
                     fnaData.debtStudent + fnaData.debtOther;
  const netWorth = totalAssets - totalDebts;

  // Calculate protection gap (using 10x income rule as baseline)
  const recommendedLifeInsurance = (totalIncome * 12 * 10) + totalDebts;
  const currentLifeInsurance = fnaData.lifeCoverageYou + fnaData.lifeCoverageSpouse;
  const protectionGap = Math.max(0, recommendedLifeInsurance - currentLifeInsurance);

  // Count goals
  const goalsCount = Object.values(fnaData.goals).filter(g => g).length;

  // Calculate Financial Health Score (0-100)
  let score = 0;

  // Cash Flow Score (0-25 points)
  if (monthlyCashFlow > totalIncome * 0.2) score += 25;
  else if (monthlyCashFlow > totalIncome * 0.1) score += 18;
  else if (monthlyCashFlow > 0) score += 10;
  else score += 0;

  // Net Worth Score (0-25 points)
  const annualIncome = totalIncome * 12;
  if (netWorth > annualIncome * 2) score += 25;
  else if (netWorth > annualIncome) score += 18;
  else if (netWorth > 0) score += 10;
  else score += 0;

  // Protection Score (0-25 points)
  const protectionCoverage = currentLifeInsurance / recommendedLifeInsurance;
  if (protectionCoverage >= 0.8) score += 25;
  else if (protectionCoverage >= 0.5) score += 15;
  else if (protectionCoverage >= 0.2) score += 8;
  else score += 0;

  // Debt Management Score (0-25 points)
  const debtToIncome = totalDebts / annualIncome;
  if (debtToIncome < 1) score += 25;
  else if (debtToIncome < 2) score += 18;
  else if (debtToIncome < 3) score += 10;
  else score += 5;

  score = Math.round(score);

  // Display results
  displayFNAResults(monthlyCashFlow, netWorth, protectionGap, goalsCount, score,
                   totalIncome, totalExpenses, totalAssets, totalDebts, currentLifeInsurance);

  // Navigate to results
  nextFNAStep(6);
}

function displayFNAResults(cashFlow, netWorth, protectionGap, goalsCount, score,
                          totalIncome, totalExpenses, totalAssets, totalDebts, currentInsurance) {
  // Update summary cards
  document.getElementById('fnaResultCashFlow').textContent = formatCurrency(cashFlow);
  document.getElementById('fnaResultCashFlowStatus').textContent =
    cashFlow > 0 ? 'Positive surplus' : 'Deficit - needs attention';
  document.getElementById('fnaResultCashFlowStatus').style.color = cashFlow > 0 ? '#10b981' : '#ef4444';

  const netWorthElement = document.getElementById('fnaResultNetWorth');
  netWorthElement.textContent = formatCurrency(netWorth);
  netWorthElement.style.color = netWorth >= 0 ? '#10b981' : '#ef4444';

  document.getElementById('fnaResultNetWorthStatus').textContent =
    netWorth > 0 ? 'Building wealth' : 'Needs improvement';
  document.getElementById('fnaResultNetWorthStatus').style.color = netWorth > 0 ? '#10b981' : '#ef4444';

  document.getElementById('fnaResultProtectionGap').textContent = formatCurrency(protectionGap);
  document.getElementById('fnaResultProtectionStatus').textContent =
    protectionGap === 0 ? 'Fully protected' : 'Additional coverage needed';
  document.getElementById('fnaResultProtectionStatus').style.color = protectionGap === 0 ? '#10b981' : '#f59e0b';

  document.getElementById('fnaResultGoalsCount').textContent = goalsCount;
  document.getElementById('fnaResultGoalsStatus').textContent =
    goalsCount > 0 ? goalsCount + ' active goals' : 'No goals selected';

  // Update health score
  document.getElementById('fnaScoreText').textContent = score;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;
  document.getElementById('fnaScoreCircle').style.strokeDashoffset = offset;

  // Score color
  let scoreColor = '#ef4444';
  if (score >= 75) scoreColor = '#10b981';
  else if (score >= 50) scoreColor = '#f59e0b';
  document.getElementById('fnaScoreCircle').setAttribute('stroke', scoreColor);
  document.getElementById('fnaScoreText').setAttribute('fill', scoreColor);

  // Score description
  let scoreDescription = '';
  if (score >= 75) {
    scoreDescription = '<h5>Excellent Financial Health!</h5><p>You are doing great! Your finances are well-managed with strong cash flow, good savings, and adequate protection. Focus on optimizing your investments and tax strategies to maximize wealth growth.</p>';
  } else if (score >= 50) {
    scoreDescription = '<h5>Good Progress, Room for Improvement</h5><p>You are on the right track but there are opportunities to strengthen your financial position. Let us work on building emergency funds, optimizing debt management, and ensuring adequate protection.</p>';
  } else {
    scoreDescription = '<h5>Needs Attention</h5><p>Your financial foundation needs strengthening. We should focus on improving cash flow, reducing debt, building emergency savings, and establishing proper protection. A comprehensive plan will help you get on track.</p>';
  }
  document.getElementById('fnaScoreDescription').innerHTML = scoreDescription;

  // Generate recommendations
  generateFNARecommendations(cashFlow, netWorth, protectionGap, totalIncome, totalDebts);

  // Generate action plan
  generateFNAActionPlan(cashFlow, protectionGap, totalDebts);

  // Generate goals timeline
  generateFNAGoalsTimeline();

  // Generate consultation topics
  generateFNAConsultationTopics(cashFlow, protectionGap, totalDebts);

  // Render dashboard charts
  renderFNADashboardCharts(totalIncome, totalExpenses, cashFlow, totalAssets, totalDebts);

  // Generate tax savings suggestions
  generateTaxSavingsSuggestions(totalIncome, totalAssets, totalDebts, cashFlow);
}

// Render FNA Dashboard Charts
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

// Generate Tax Savings Suggestions
function generateTaxSavingsSuggestions(totalIncome, totalAssets, totalDebts, cashFlow) {
  const taxSavingsDiv = document.getElementById('fnaTaxSavings');
  let suggestions = '';

  const annualIncome = totalIncome * 12;
  const taxRate = fnaData.taxRate / 100;

  // RRSP Suggestion
  const maxRRSPContribution = annualIncome * 0.18;
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
  const tfsaLimit = 95000;
  const currentTFSA = fnaData.assetsTFSA;
  const tfsaRoom = Math.max(0, tfsaLimit - currentTFSA);

  if (tfsaRoom > 1000) {
    const potentialTFSAContribution = Math.min(tfsaRoom, cashFlow * 12 * 0.2);
    const tfsa10YearGrowth = potentialTFSAContribution * Math.pow(1.06, 10);
    const tfsa10YearTaxSavings = (tfsa10YearGrowth - potentialTFSAContribution) * 0.25;

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

  // FHSA Suggestion
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
    const respAnnualGrant = 500 * fnaData.dependents;
    const respContribution = 2500 * fnaData.dependents;

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

  // Income Splitting
  if (fnaData.married && fnaData.income1 > 0 && fnaData.income2 > 0) {
    const incomeDiff = Math.abs(fnaData.income1 - fnaData.income2);
    if (incomeDiff > fnaData.income1 * 0.3) {
      const splittingSavings = (incomeDiff * 12) * 0.1;

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
  if (rrspRoom > 1000) totalAnnualSavings += Math.min(rrspRoom, cashFlow * 12 * 0.3) * taxRate;
  if (fnaData.goals.home && fnaData.assetsHome === 0) totalAnnualSavings += 8000 * taxRate;
  if (fnaData.dependents > 0) totalAnnualSavings += 500 * fnaData.dependents;

  if (totalAnnualSavings > 1000) {
    suggestions = '<div class="fna-tax-savings-card" style="background: linear-gradient(135deg, #fef3c7, #fde047); border-left-color: #f59e0b; border-width: 4px;"><div class="fna-tax-savings-icon">🎯</div><div class="fna-tax-savings-content"><h5>Total Annual Tax Savings Potential</h5><div class="fna-tax-savings-amount" style="font-size: 32px; color: #92400e;">' + formatCurrency(totalAnnualSavings) + '</div><p style="font-size: 16px; color: #78350f;"><strong>By implementing the strategies below, you could save approximately ' + formatCurrency(totalAnnualSavings) + ' in your first year alone!</strong></p></div></div>' + suggestions;
  }

  if (!suggestions) {
    suggestions = '<p style="color: #64748b; text-align: center;">Great job! You are maximizing your tax-advantaged accounts. Continue the good work!</p>';
  }

  taxSavingsDiv.innerHTML = suggestions;
}

function generateFNARecommendations(cashFlow, netWorth, protectionGap, totalIncome, totalDebts) {
  const recommendationsDiv = document.getElementById('fnaRecommendations');
  let recommendations = '';

  // Cash Flow Recommendation
  if (cashFlow < 0) {
    recommendations += '<div class="fna-recommendation priority"><div class="fna-recommendation-icon">⚠️</div><div class="fna-recommendation-content"><h5>URGENT: Address Negative Cash Flow</h5><p>You are spending ' + formatCurrency(Math.abs(cashFlow)) + ' more than you earn each month. This is unsustainable and needs immediate attention. We need to review your expenses and create a budget that balances your income and spending.</p></div></div>';
  } else if (cashFlow < totalIncome * 0.1) {
    recommendations += '<div class="fna-recommendation"><div class="fna-recommendation-icon">💰</div><div class="fna-recommendation-content"><h5>Increase Your Savings Rate</h5><p>You are only saving ' + ((cashFlow / totalIncome) * 100).toFixed(1) + '% of your income. Aim for at least 10-20% to build wealth faster. Let us identify opportunities to reduce expenses or increase income.</p></div></div>';
  }

  // Protection Gap Recommendation
  if (protectionGap > 0) {
    recommendations += '<div class="fna-recommendation priority"><div class="fna-recommendation-icon">🛡️</div><div class="fna-recommendation-content"><h5>Close Your Protection Gap</h5><p>You need an additional ' + formatCurrency(protectionGap) + ' in life insurance to fully protect your family. Without adequate coverage, your loved ones could face financial hardship. Let us discuss affordable term life insurance options.</p></div></div>';
  }

  // Debt Recommendation
  if (totalDebts > totalIncome * 12 * 2) {
    recommendations += '<div class="fna-recommendation"><div class="fna-recommendation-icon">📉</div><div class="fna-recommendation-content"><h5>Develop a Debt Reduction Strategy</h5><p>Your total debt (' + formatCurrency(totalDebts) + ') is over 2x your annual income. This is limiting your ability to build wealth. Let us create a strategic plan to pay down high-interest debt while maintaining your quality of life.</p></div></div>';
  }

  // Tax Optimization
  if (fnaData.goals.tax || (fnaData.assetsRRSP < totalIncome * 0.1 && fnaData.assetsTFSA < 50000)) {
    recommendations += '<div class="fna-recommendation"><div class="fna-recommendation-icon">💡</div><div class="fna-recommendation-content"><h5>Maximize Tax-Advantaged Accounts</h5><p>You could save thousands in taxes by maximizing your RRSP and TFSA contributions. Based on your income, you should be contributing significantly more to reduce your tax burden and grow wealth tax-free.</p></div></div>';
  }

  // Emergency Fund
  if (fnaData.goals.emergency && fnaData.assetsCash < (totalIncome * 3)) {
    recommendations += '<div class="fna-recommendation"><div class="fna-recommendation-icon">🆘</div><div class="fna-recommendation-content"><h5>Build Your Emergency Fund</h5><p>You should have 3-6 months of expenses (' + formatCurrency(totalIncome * 3) + ' to ' + formatCurrency(totalIncome * 6) + ') in a readily accessible savings account. This protects you from unexpected job loss, medical emergencies, or urgent repairs.</p></div></div>';
  }

  // Retirement Planning
  if (fnaData.goals.retirement) {
    const age = fnaData.dob ? calculateAge(fnaData.dob) : 35;
    const retirementSavings = fnaData.assetsRRSP + fnaData.assetsTFSA + fnaData.assetsInvestments;
    const recommendedRetirement = totalIncome * 12 * (65 - age) * 0.15;

    if (retirementSavings < recommendedRetirement * 0.3) {
      recommendations += '<div class="fna-recommendation"><div class="fna-recommendation-icon">🎯</div><div class="fna-recommendation-content"><h5>Accelerate Retirement Savings</h5><p>You are behind on retirement savings for your age. To retire comfortably at 65, you should aim to save 10-15% of your gross income annually. Let us create a catch-up strategy using RRSP, TFSA, and employer matching programs.</p></div></div>';
    }
  }

  recommendationsDiv.innerHTML = recommendations || '<p style="color: #10b981;">Great job! Your finances are well-managed. Continue monitoring and optimizing your strategy.</p>';
}

function generateFNAActionPlan(cashFlow, protectionGap, totalDebts) {
  const actionPlanDiv = document.getElementById('fnaActionPlan');
  let actions = '';
  let actionNumber = 1;

  // Priority actions based on situation
  if (cashFlow < 0) {
    actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Create a detailed monthly budget and identify areas to cut expenses</div></div>';
  }

  if (protectionGap > 0) {
    actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Get life insurance quotes to close your protection gap</div></div>';
  }

  if (fnaData.assetsCash < (fnaData.income1 + fnaData.income2 + fnaData.otherIncome) * 3) {
    actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Start building an emergency fund with automatic monthly transfers</div></div>';
  }

  if (fnaData.debtCredit > 0) {
    actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Pay down high-interest credit card debt as priority #1</div></div>';
  }

  if (fnaData.goals.tax) {
    actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Maximize RRSP contributions before March 1st tax deadline</div></div>';
  }

  actions += '<div class="fna-action-item"><div class="fna-action-number">' + actionNumber++ + '</div><div class="fna-action-text">Book a free consultation to create your personalized financial plan</div></div>';

  actionPlanDiv.innerHTML = actions;
}

function generateFNAGoalsTimeline() {
  const timelineDiv = document.getElementById('fnaGoalsTimeline');
  let shortTerm = [];
  let midRange = [];
  let longTerm = [];

  // Group goals by timeframe
  const goalsList = [
    { id: 'goalRetirement', name: 'Build Retirement Wealth', radio: 'timeRetirement' },
    { id: 'goalProtection', name: 'Family Protection', radio: 'timeProtection' },
    { id: 'goalEmergency', name: 'Emergency Fund', radio: 'timeEmergency' },
    { id: 'goalHome', name: 'Home/Mortgage', radio: 'timeHome' },
    { id: 'goalEducation', name: 'Education Funding', radio: 'timeEducation' },
    { id: 'goalDebt', name: 'Pay Off Debt', radio: 'timeDebt' },
    { id: 'goalTax', name: 'Tax Optimization', radio: 'timeTax' },
    { id: 'goalBusiness', name: 'Start Business', radio: 'timeBusiness' }
  ];

  goalsList.forEach(goal => {
    if (document.getElementById(goal.id).checked) {
      const timeframe = document.querySelector('input[name="' + goal.radio + '"]:checked')?.value;
      if (timeframe === 'short') shortTerm.push(goal.name);
      else if (timeframe === 'mid') midRange.push(goal.name);
      else if (timeframe === 'long') longTerm.push(goal.name);
    }
  });

  let timeline = '';

  if (shortTerm.length > 0) {
    timeline += '<div class="fna-timeline-section short-term"><h5>🔥 Short-Term Goals (1-3 Years)</h5><ul>' + shortTerm.map(g => '<li>' + g + '</li>').join('') + '</ul></div>';
  }

  if (midRange.length > 0) {
    timeline += '<div class="fna-timeline-section mid-range"><h5>🎯 Mid-Range Goals (3-7 Years)</h5><ul>' + midRange.map(g => '<li>' + g + '</li>').join('') + '</ul></div>';
  }

  if (longTerm.length > 0) {
    timeline += '<div class="fna-timeline-section long-term"><h5>🌟 Long-Term Goals (7+ Years)</h5><ul>' + longTerm.map(g => '<li>' + g + '</li>').join('') + '</ul></div>';
  }

  timelineDiv.innerHTML = timeline || '<p style="color: #64748b; text-align: center;">No goals selected</p>';
}

function generateFNAConsultationTopics(cashFlow, protectionGap, totalDebts) {
  const topicsDiv = document.getElementById('fnaConsultationTopics');
  let topics = '';

  if (cashFlow < 0 || cashFlow < fnaData.income1 * 0.1) {
    topics += '<li>Cash flow optimization and budgeting strategies</li>';
  }

  if (protectionGap > 0) {
    topics += '<li>Life insurance options to protect your family</li>';
  }

  if (totalDebts > 0) {
    topics += '<li>Debt consolidation and payoff strategies</li>';
  }

  if (fnaData.goals.tax) {
    topics += '<li>Tax optimization with RRSP, TFSA, and RESP</li>';
  }

  if (fnaData.goals.retirement) {
    topics += '<li>Retirement planning and wealth accumulation</li>';
  }

  if (fnaData.goals.education && fnaData.dependents > 0) {
    topics += '<li>RESP strategies to maximize education grants</li>';
  }

  topics += '<li>Comprehensive financial plan tailored to your goals</li>';

  topicsDiv.innerHTML = topics;
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function resetFNA() {
  // Reset all form fields
  document.querySelectorAll('#fna-tool input[type="text"], #fna-tool input[type="number"], #fna-tool input[type="date"], #fna-tool input[type="tel"], #fna-tool textarea').forEach(input => {
    input.value = '';
  });

  document.querySelectorAll('#fna-tool input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  // Reset to step 1
  fnaCurrentStep = 1;
  document.querySelectorAll('.fna-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById('fnaStep1').classList.add('active');

  // Reset progress
  document.getElementById('fnaProgressFill').style.width = '0%';
  document.querySelectorAll('.fna-step').forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index === 0) {
      stepEl.classList.add('active');
    }
  });

  // Scroll to top
  document.querySelector('#fna-tool').scrollIntoView({ behavior: 'smooth' });
}

// FNA Owner Access Functions
function showFNAPasswordPrompt() {
  document.getElementById('fnaPublicView').style.display = 'none';
  document.getElementById('fnaPasswordPrompt').style.display = 'block';
  document.getElementById('fnaOwnerPassword').focus();
}

function hideFNAPasswordPrompt() {
  document.getElementById('fnaPasswordPrompt').style.display = 'none';
  document.getElementById('fnaPublicView').style.display = 'block';
  document.getElementById('fnaOwnerPassword').value = '';
  document.getElementById('fnaPasswordError').style.display = 'none';
}

function unlockFNATool(event) {
  event.preventDefault();
  
  const password = document.getElementById('fnaOwnerPassword').value;
  const correctPassword = 'TenPercent2024!'; // Change this password as needed
  
  if (password === correctPassword) {
    // Hide password prompt
    document.getElementById('fnaPasswordPrompt').style.display = 'none';
    
    // Show full FNA tool
    document.getElementById('fnaToolContent').style.display = 'block';
    
    // Load the full FNA tool HTML
    loadFullFNATool();
    
    // Clear password
    document.getElementById('fnaOwnerPassword').value = '';
    document.getElementById('fnaPasswordError').style.display = 'none';
    
    // Store in session
    sessionStorage.setItem('fnaOwnerAccess', 'true');
  } else {
    // Show error
    document.getElementById('fnaPasswordError').style.display = 'block';
    document.getElementById('fnaOwnerPassword').value = '';
    document.getElementById('fnaOwnerPassword').focus();
  }
  
  return false;
}

function loadFullFNATool() {
  const fnaToolContent = document.getElementById('fnaToolContent');

  // Show loading message
  fnaToolContent.innerHTML = '<p style="text-align: center; padding: 40px; color: #64748b;">Loading FNA tool...</p>';

  // Fetch the FNA tool HTML
  fetch('fna_tool_content.html')
    .then(response => response.text())
    .then(html => {
      fnaToolContent.innerHTML = html;

      // Re-initialize FNA event listeners if needed
      updateFNAIncomeExpenses();

      // Scroll to the tool
      setTimeout(() => {
        document.getElementById('fnaToolContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    })
    .catch(error => {
      console.error('Error loading FNA tool:', error);
      fnaToolContent.innerHTML = '<p style="text-align: center; padding: 40px; color: #ef4444;">Error loading FNA tool. Please refresh the page.</p>';
    });
}

// Check if owner already has access on page load
document.addEventListener('DOMContentLoaded', function() {
  if (sessionStorage.getItem('fnaOwnerAccess') === 'true') {
    document.getElementById('fnaPublicView').style.display = 'none';
    document.getElementById('fnaToolContent').style.display = 'block';
    loadFullFNATool();
  }
});
