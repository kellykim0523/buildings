(() => {
  const scroller = document.querySelector('.scroll-container');
  const track = document.querySelector('#track');
  if (!scroller || !track) return;

  // 1) 휠을 가로 이동으로 통일
  const onWheel = (e) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    scroller.scrollTop += d;
    e.preventDefault();
  };
  scroller.addEventListener('wheel', onWheel, { passive: false });

  // 2) “3개 묶음”을 무한히 길게 만들기(충분히 길 때까지 복제)
  const seed = Array.from(track.children); // 처음 3개(엠/크/원)
  const ensureLength = () => {
    // 너무 많이 쌓이지 않게: 이전 복제물 정리(선택)
    // track.innerHTML = ""; seed.forEach(el => track.appendChild(el));

    // 현재 가시 영역 너비의 여러 배(여유 있게)까지 늘림
    const targetWidth = window.innerWidth * 6;

    // track이 targetWidth보다 짧으면 계속 붙여넣기
    while (track.scrollWidth < targetWidth) {
      seed.forEach((node) => {
        const clone = node.cloneNode(true);
        // 탭 포커스 중복 방지(원하면)
        clone.removeAttribute('tabindex');
        track.appendChild(clone);
      });
    }
  };

  ensureLength();
  window.addEventListener('resize', ensureLength);

  // 3) 모바일/클릭 말풍선 토글(복제된 것들도 커버되게 "이벤트 위임")
  track.addEventListener('click', (e) => {
    const b = e.target.closest('.building');
    if (!b) return;

    // 다른 것 닫기
    track.querySelectorAll('.building.is-active').forEach(x => {
      if (x !== b) x.classList.remove('is-active');
    });

    b.classList.toggle('is-active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.building')) {
      track.querySelectorAll('.building.is-active').forEach(x => x.classList.remove('is-active'));
    }
  });
})();
