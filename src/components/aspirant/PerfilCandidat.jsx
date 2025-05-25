import React from 'react';

const PerfilCandidat = ({ candidat }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-xl mb-2">{candidat.nom}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Categoria</p>
              <p className="font-medium">{candidat.categoria}</p>
            </div>
            <div>
              <p className="text-gray-600">Especialitat</p>
              <p className="font-medium">{candidat.especialitat}</p>
            </div>
            <div>
              <p className="text-gray-600">Experiència</p>
              <p className="font-medium">{candidat.experiencia} anys</p>
            </div>
            <div>
              <p className="text-gray-600">Contacte</p>
              <p className="font-medium text-xs">{candidat.email}</p>
            </div>
          </div>
          
          {candidat.titulacions && candidat.titulacions.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm mb-2">Titulacions</p>
              <div className="flex flex-wrap gap-1">
                {candidat.titulacions.map((titulacio, index) => (
                  <span 
                    key={index}
                    className="bg-white px-2 py-1 rounded text-xs text-gray-700 border"
                  >
                    {titulacio}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center ml-6">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-md">
            <span className="text-3xl font-bold text-blue-600">{candidat.puntuacio}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Puntuació</p>
        </div>
      </div>
    </div>
  );
};

export default PerfilCandidat;