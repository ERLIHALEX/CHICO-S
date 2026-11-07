(function () {
  'use strict';

  /* 1. Аккуратная обработка возможной ошибки загрузки изображений */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-fallback');
    });
  });

  /* 2. Мобильная навигация */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMobileMenu(forceOpen) {
    if (!burgerBtn || !mobileMenu) return;
    const isOpen =
      typeof forceOpen === 'boolean'
        ? forceOpen
        : burgerBtn.getAttribute('aria-expanded') !== 'true';

    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    mobileMenu.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', function () {
      toggleMobileMenu();
    });
  }

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleMobileMenu(false);
      });
    });
  }

  /* 3. Переключение категорий в разделе «Услуги» + клавиатурная доступность */
  const serviceTabs = Array.from(document.querySelectorAll('.services__tab'));
  const serviceViews = Array.from(document.querySelectorAll('.service-view'));

  function activateServiceCategory(serviceKey, shouldFocus) {
    serviceTabs.forEach(function (tab) {
      const isMatch = tab.getAttribute('data-service') === serviceKey;
      tab.classList.toggle('is-active', isMatch);
      tab.setAttribute('aria-selected', String(isMatch));
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
      if (isMatch && shouldFocus) {
        tab.focus();
      }
    });

    serviceViews.forEach(function (view) {
      const isMatch = view.id === 'panel-' + serviceKey;
      view.classList.toggle('is-active', isMatch);
      view.hidden = !isMatch;
    });
  }

  serviceTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      const key = tab.getAttribute('data-service');
      activateServiceCategory(key, false);
    });

    tab.addEventListener('keydown', function (event) {
      let targetIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        targetIndex = (index + 1) % serviceTabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        targetIndex = (index - 1 + serviceTabs.length) % serviceTabs.length;
      } else if (event.key === 'Home') {
        targetIndex = 0;
      } else if (event.key === 'End') {
        targetIndex = serviceTabs.length - 1;
      }

      if (targetIndex !== null) {
        event.preventDefault();
        const nextKey = serviceTabs[targetIndex].getAttribute('data-service');
        activateServiceCategory(nextKey, true);
      }
    });
  });

  /* Быстрый переход к нужной вкладке услуг из первого экрана */
  document.querySelectorAll('[data-open-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      const key = link.getAttribute('data-open-service');
      if (key) {
        activateServiceCategory(key, false);
      }
    });
  });

  /* 4. Фильтрация галереи «Наши работы» */
  const filterPills = document.querySelectorAll('.filter-pill');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      const filter = pill.getAttribute('data-filter');

      filterPills.forEach(function (btn) {
        btn.classList.remove('is-active');
      });
      pill.classList.add('is-active');

      galleryCards.forEach(function (card) {
        const category = card.getAttribute('data-category');
        const visible = filter === 'all' || category === filter;
        card.hidden = !visible;
      });
    });
  });

  /* 5. Lightbox для увеличения фотографий */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCat = document.getElementById('lightbox-cat');
  const lightboxStage = document.getElementById('lightbox-stage');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxBookLink = document.getElementById('lightbox-book-link');
  let previousActiveElement = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg) return;
    previousActiveElement = document.activeElement;

    const src = trigger.getAttribute('data-src') || '';
    const title = trigger.getAttribute('data-title') || "CHICO'S Nail & Beauty Club";
    const categoryLabel = trigger.getAttribute('data-category-label') || "CHICO'S";
    const isCompact = trigger.getAttribute('data-compact') === 'true';

    lightboxImg.src = src;
    lightboxImg.alt = title;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxCat) lightboxCat.textContent = categoryLabel;
    if (lightboxStage) {
      lightboxStage.classList.toggle('is-compact', isCompact);
    }

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lightboxImg) {
      lightboxImg.src = '';
    }
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  document.querySelectorAll('.js-lightbox-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openLightbox(trigger);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }
  if (lightboxBookLink) {
    lightboxBookLink.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeLightbox();
      toggleMobileMenu(false);
    }
  });

  /* 6. Интерактивный выбор направлений в секции «Онлайн-запись» */
  const bookingChips = Array.from(document.querySelectorAll('.booking-chip'));
  const bookingOutput = document.getElementById('booking-selected-output');

  function updateBookingOutput() {
    if (!bookingOutput) return;
    const selectedNames = bookingChips
      .filter(function (chip) {
        return chip.classList.contains('is-selected');
      })
      .map(function (chip) {
        return chip.getAttribute('data-service-name');
      });

    bookingOutput.textContent =
      selectedNames.length > 0
        ? selectedNames.join(' + ')
        : 'Общая консультация и подбор услуги';
  }

  bookingChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const isSelected = chip.classList.toggle('is-selected');
      chip.setAttribute('aria-pressed', String(isSelected));
      const checkEl = chip.querySelector('.booking-chip__check');
      if (checkEl) {
        checkEl.textContent = isSelected ? '✓' : '+';
      }
      updateBookingOutput();
    });
  });

  /* Подстановка выбранного направления из разделов «Услуги» и «Команда» */
  document.querySelectorAll('.js-select-booking').forEach(function (btn) {
    btn.addEventListener('click', function (event) {
      const targetService = btn.getAttribute('data-booking-service');
      if (!targetService) return;

      bookingChips.forEach(function (chip) {
        const match = chip.getAttribute('data-service-name') === targetService;
        chip.classList.toggle('is-selected', match);
        chip.setAttribute('aria-pressed', String(match));
        const checkEl = chip.querySelector('.booking-chip__check');
        if (checkEl) {
          checkEl.textContent = match ? '✓' : '+';
        }
      });

      updateBookingOutput();

      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        event.preventDefault();
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* 7. Плавное появление секций при прокрутке (с учётом prefers-reduced-motion) */
  const revealItems = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
