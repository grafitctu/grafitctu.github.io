(() => {
  'use strict';
  const M = window.FeatureMath;
  const { $, t, num, print, read, on, readoutRange, table, plotting, teal, orange } = window.FeatureUI;
  const rate = (n,total) => n + '/' + total + ' = ' + num(100*n/total,1) + ' %';

  function renderVerification() {
    const threshold = read('match-threshold');
    const report = M.verificationErrors(threshold);
    const plot = plotting($('verification-chart'), 0, 100, 0, 3, t('skóre podobnosti','similarity score'), '');
    plot.line([[threshold,.25],[threshold,2.7]], '#41535c', 3, [8,5]);
    plot.label([threshold,2.7], 'τ', '#41535c', 5, -8);
    for (const [kind,lane,color] of [['nonmated',1,orange],['mated',2,teal]]) {
      const label = kind === 'mated' ? t('Stejná osoba','Same identity') : t('Různé osoby','Different identities');
      plot.label([0,lane+.37],label,color,2,0);
      M.verification[kind].forEach((score,index) => {
        const decision = score >= threshold;
        plot.point([score, lane + ((index % 3)-1)*.14],color,decision ? 'dot' : 'open',6);
      });
    }
    $('verification-values').innerHTML = table([t('Metrika','Metric'), t('Chyby / pokusy','Errors / trials')], [
      [t('Falešná shoda (FMR)','False match (FMR)'),rate(report.falseMatch,report.negatives)],
      [t('Falešná neshoda (FNMR)','False non-match (FNMR)'),rate(report.miss,report.positives)]
    ]);
    readoutRange('match-threshold');
  }

  function renderPad() {
    const matchThreshold = read('cascade-match'), padThreshold = read('pad-threshold');
    const enabled = $('pad-enabled').checked;
    const plot = plotting($('pad-chart'),0,100,0,100,t('skóre podobnosti','similarity score'),'PAD');
    plot.line([[matchThreshold,0],[matchThreshold,100]],'#41535c',3,[8,5]);
    plot.line([[0,padThreshold],[100,padThreshold]],enabled ? '#41535c' : '#a9b9b7',3,[8,5]);
    for (const [kind,color] of [['bonaFide',teal],['simulated',orange]]) {
      M.padData[kind].forEach(([match,pad]) => {
        const accepted = match >= matchThreshold && (!enabled || pad >= padThreshold);
        plot.point([match,pad],color,accepted ? 'dot' : 'open',8);
      });
    }
    const report = M.padErrors(matchThreshold,padThreshold,enabled);
    $('pad-values').innerHTML = table([t('Metrika','Metric'),t('Podíl','Rate')], [
      [t('Běžný pokus zamítnutý PAD (BPCER)','Bona fide rejected by PAD (BPCER)'),rate(report.errors,report.genuine)],
      [t('Simulovaný pokus prošel přes PAD (APCER)','Simulated attack passes PAD (APCER)'),rate(report.missedAttacks,report.attacks)],
      [t('Přijaté pravé pokusy','Bona fide accepted by system'),rate(report.genuineAccepted,report.genuine)],
      [t('Přijaté simulované pokusy','Simulated attacks accepted by system'),rate(report.attackAccepted,report.attacks)]
    ]);
    print('pad-mode',t('Zelená = běžný pokus. Oranžová = simulovaný podvrh. Plný bod = přijatý pokus.', 
      'Green = bona fide attempt. Orange = simulated presentation attack. Solid point = accepted attempt.'));
    readoutRange('cascade-match');
    readoutRange('pad-threshold');
  }

  on('match-threshold','input',renderVerification);
  on('cascade-match','input',renderPad);
  on('pad-threshold','input',renderPad);
  on('pad-enabled','change',renderPad);
  document.addEventListener('feature-language',() => { renderVerification(); renderPad(); });
  renderVerification();
  renderPad();
})();
