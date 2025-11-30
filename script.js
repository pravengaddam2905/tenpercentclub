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
  const fireNumber = netRetirementIncome / withdrawalRate;

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
    preReturnRate
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
  preReturnRate
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
}
