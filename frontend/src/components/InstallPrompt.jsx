import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const InstallPrompt = ({ variant = 'button' }) => {
  const { lang, t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const isAppleDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install dialog (Android, Chrome, Edge, Windows)
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show instructional modal (iOS Safari or unsupported browsers)
      setShowModal(true);
    }
  };

  // If already installed, hide the install button
  if (isInstalled) return null;

  return (
    <>
      {variant === 'button' && (
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 hover:border-emerald-400 text-xs font-semibold rounded-xl transition shadow-xs"
          title={t('installApp')}
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          <span className="hidden sm:inline">{t('installApp')}</span>
          <span className="sm:hidden">{lang === 'hi' ? 'ऐप इंस्टॉल' : 'Install'}</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <div className="p-3 mx-3 mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <h4 className="font-bold text-xs">{t('installApp')}</h4>
          </div>
          <p className="text-2xs text-emerald-100 mb-2.5 leading-snug">
            {t('installAppDesc')}
          </p>
          <button
            onClick={handleInstallClick}
            className="w-full py-1.5 px-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('installBtn')}</span>
          </button>
        </div>
      )}

      {/* Guide Modal for iOS or manual install */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Download className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-800 mb-1">
              {t('installModalTitle')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('installAppDesc')}
            </p>

            {isIOS ? (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{t('iosInstallTitle')}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-2xs">
                    1
                  </span>
                  <span>{t('iosStep1')}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-2xs">
                    2
                  </span>
                  <span>{t('iosStep2')}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-2xs">
                    3
                  </span>
                  <span>{t('iosStep3')}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <span>{t('desktopInstallTitle')}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-2xs">
                    1
                  </span>
                  <span>{t('desktopStep1')}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-2xs">
                    2
                  </span>
                  <span>{t('desktopStep2')}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {lang === 'hi' ? 'समझ गया' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
