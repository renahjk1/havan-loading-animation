import { useEffect, useState } from 'react';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const duration = 6000; // 6 segundos
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col items-center gap-8">
          {/* Ícone de sucesso */}
          <div className="relative w-24 h-24">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Círculo de sucesso */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
              />
              {/* Checkmark */}
              <path
                d="M 30 50 L 45 65 L 70 35"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Texto de sucesso */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Dados validados!
            </h1>
            <p className="text-gray-600 text-sm">
              Suas informações foram processadas com sucesso
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex flex-col items-center gap-8">
        {/* Animação de círculo */}
        <div className="relative w-24 h-24">
          {/* Círculo de fundo */}
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Círculo de progresso */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 0.05s linear',
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          </svg>

          {/* Percentual no centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Texto */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Analisando dados...
          </h1>
          <p className="text-gray-600 text-sm">
            Por favor, aguarde enquanto processamos suas informações
          </p>
        </div>
      </div>
    </div>
  );
}
