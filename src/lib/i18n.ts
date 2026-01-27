import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Common
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      
      // Navigation
      dashboard: 'Dashboard',
      profile: 'Profile',
      clients: 'Clients',
      inspections: 'Inspections',
      uploadInspection: 'Upload Inspection',
      
      // Auth
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to your account',
      loginError: 'Invalid email or password',
      
      // Profile
      profileTitle: 'Your Profile',
      fullName: 'Full Name',
      updateProfile: 'Update Profile',
      profileUpdated: 'Profile updated successfully',
      
      // Clients (Admin)
      manageClients: 'Manage Clients',
      createClient: 'Create New Client',
      clientName: 'Client Name',
      clientEmail: 'Client Email',
      temporaryPassword: 'Temporary Password',
      clientCreated: 'Client created and email sent',
      
      // Inspections (Client)
      myInspections: 'My Inspections',
      uploadNew: 'Upload New Inspection',
      inspectionTitle: 'Title',
      inspectionDescription: 'Description',
      location: 'Location',
      inspectionType: 'Inspection Type',
      status: 'Status',
      inspectionDate: 'Inspection Date',
      file: 'File',
      uploadSuccess: 'Inspection uploaded successfully',
      
      // Roles
      admin: 'Admin',
      client: 'Client',
      role: 'Role',
      
      // Theme
      toggleTheme: 'Toggle theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      systemMode: 'System',
      
      // Dashboard
      dashboardTitle: 'Power Line Analytics Dashboard',
      dashboardSubtitle: 'Monitor and analyze power line inspection data in real-time',
      welcomeMessage: 'Welcome! Use the sidebar to navigate to your inspections.',
      
      // Footer
      copyright: '© 2025 PowerScan Analytics. All rights reserved.',
      version: 'Version 3.2.1',
      
      // Common UI
      main: 'Main',
      createdAt: 'Created At',
      date: 'Date',
      noInspections: 'No inspections yet',
      clientCreatedMock: 'Client created successfully (mock data)',
      home: 'Home',
      comingSoon: 'This feature is coming soon',

      // Inspections submenus
      distribution: 'Distribution',
      transmission: 'Transmission',

      // System submenus
      system: 'System',
      elements: 'Elements',
      lamps: 'Lamps',
      cars: 'Cars',
      actions: 'Actions',
      methods: 'Methods',
      feeders: 'Feeders',
      eas: 'EAs',
      alarms: 'Alarms',

      // MeasureDetails - Statistics
      statistics: 'Statistics',
      feederElementsVsInspectionMeasures: 'Feeder Elements vs Inspection Measures',
      inspectionStatistics: 'Inspection Statistics',
      feederName: 'Feeder Name',
      feederLength: 'Feeder Length',
      distanceTraveled: 'Distance traveled',
      firstMeasure: 'First measure',
      lastMeasure: 'Last measure',
      totalMeasures: 'Total measures',
      totalTime: 'Total time',
      dailyStatistics: 'Daily Statistics',
      measuresCarThermographic: 'Measures - Car - Thermographic',
      show: 'Show',
      entries: 'entries',
      id: 'ID',
      address: 'ADDRESS',
      dateLabel: 'DATE',
      actionLabel: 'ACTION',
      hotspot: 'HOTSPOT',
      reprocessedAt: 'REPROCESSED AT',
      actionColumn: 'Actions',
      open: 'Open',
      showing: 'Showing',
      of: 'of',
      to: 'to',
      previous: 'Previous',
      next: 'Next',
      map: 'Map',
      mapVisualizationPlaceholder: 'Map visualization placeholder',
      allRightsReserved: 'All rights reserved',
      immediateAction: 'Immediate Action',
      scheduledAction: 'Scheduled Action',
      noAction: 'No Action',
      actionNotDefined: 'Action not Defined',
      
      // MeasureImageDetails
      filter: 'Filter',
      sort: 'Sort',
      returnToInspectionMeasures: 'Return to Inspection Measures',
      pdf: 'PDF',
      tiff: 'TIFF',
      optical: 'Optical',
      max: 'Max',
      images: 'Images',
      thermalImage: 'Thermal Image',
      opticalImage: 'Optical Image',
      information: 'Information',
      measureId: 'Measure ID',
      camera: 'Camera',
      inference: 'Inference',
      coordinates: 'Coordinates',
      relativeHumidity: 'Relative Humidity',
      wind: 'Wind',
      temperature: 'Temperature',
      speed: 'Speed',
      detectedFeeders: 'Detected Feeders',
      inspectionName: 'Inspection Name',
      inspectionFeeder: 'Inspection Feeder',
      load: 'Load',
      observations: 'Observations',
      actionDetails: 'Action Details',
      element: 'Element',
      opNumbers: 'OP Numbers',
      tAbs: 'T Abs',
      tDelta: 'T Delta',
      finalAction: 'Final Action',
      count: 'Count',
    },
  },
  es: {
    translation: {
      // Common
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      loading: 'Cargando...',
      
      // Navigation
      dashboard: 'Panel',
      profile: 'Perfil',
      clients: 'Clientes',
      inspections: 'Inspecciones',
      uploadInspection: 'Subir Inspección',
      
      // Auth
      loginTitle: 'Bienvenido de nuevo',
      loginSubtitle: 'Inicia sesión en tu cuenta',
      loginError: 'Correo o contraseña inválidos',
      
      // Profile
      profileTitle: 'Tu Perfil',
      fullName: 'Nombre Completo',
      updateProfile: 'Actualizar Perfil',
      profileUpdated: 'Perfil actualizado exitosamente',
      
      // Clients (Admin)
      manageClients: 'Gestionar Clientes',
      createClient: 'Crear Nuevo Cliente',
      clientName: 'Nombre del Cliente',
      clientEmail: 'Correo del Cliente',
      temporaryPassword: 'Contraseña Temporal',
      clientCreated: 'Cliente creado y correo enviado',
      
      // Inspections (Client)
      myInspections: 'Mis Inspecciones',
      uploadNew: 'Subir Nueva Inspección',
      inspectionTitle: 'Título',
      inspectionDescription: 'Descripción',
      location: 'Ubicación',
      inspectionType: 'Tipo de Inspección',
      status: 'Estado',
      inspectionDate: 'Fecha de Inspección',
      file: 'Archivo',
      uploadSuccess: 'Inspección subida exitosamente',
      
      // Roles
      admin: 'Administrador',
      client: 'Cliente',
      role: 'Rol',
      
      // Theme
      toggleTheme: 'Cambiar tema',
      lightMode: 'Claro',
      darkMode: 'Oscuro',
      systemMode: 'Sistema',
      
      // Dashboard
      dashboardTitle: 'Panel de Análisis de Líneas Eléctricas',
      dashboardSubtitle: 'Monitorea y analiza datos de inspección de líneas eléctricas en tiempo real',
      welcomeMessage: '¡Bienvenido! Usa la barra lateral para navegar a tus inspecciones.',
      
      // Footer
      copyright: '© 2025 PowerScan Analytics. Todos los derechos reservados.',
      version: 'Versión 3.2.1',
      
      // Common UI
      main: 'Principal',
      createdAt: 'Creado el',
      date: 'Fecha',
      noInspections: 'Aún no hay inspecciones',
      clientCreatedMock: 'Cliente creado exitosamente (datos de prueba)',
      home: 'Inicio',
      comingSoon: 'Esta función estará disponible pronto',

      // Inspections submenus
      distribution: 'Distribución',
      transmission: 'Transmisión',

      // System submenus
      system: 'Sistema',
      elements: 'Elementos',
      lamps: 'Lámparas',
      cars: 'Vehículos',
      actions: 'Acciones',
      methods: 'Métodos',
      feeders: 'Alimentadores',
      eas: 'EAs',
      alarms: 'Alarmas',

      // MeasureDetails - Statistics
      statistics: 'Estadísticas',
      feederElementsVsInspectionMeasures: 'Elementos de Alimentador vs Medidas de Inspección',
      inspectionStatistics: 'Estadísticas de Inspección',
      feederName: 'Nombre del Alimentador',
      feederLength: 'Longitud del Alimentador',
      distanceTraveled: 'Distancia recorrida',
      firstMeasure: 'Primera medida',
      lastMeasure: 'Última medida',
      totalMeasures: 'Medidas totales',
      totalTime: 'Tiempo total',
      dailyStatistics: 'Estadísticas Diarias',
      measuresCarThermographic: 'Medidas - Auto - Termográfico',
      show: 'Mostrar',
      entries: 'entradas',
      id: 'ID',
      address: 'DIRECCIÓN',
      dateLabel: 'FECHA',
      actionLabel: 'ACCIÓN',
      hotspot: 'PUNTO CALIENTE',
      reprocessedAt: 'REPROCESADO EN',
      actionColumn: 'Acciones',
      open: 'Abrir',
      showing: 'Mostrando',
      of: 'de',
      to: 'a',
      previous: 'Anterior',
      next: 'Siguiente',
      map: 'Mapa',
      mapVisualizationPlaceholder: 'Marcador de posición de visualización de mapa',
      allRightsReserved: 'Todos los derechos reservados',
      immediateAction: 'Acción Inmediata',
      scheduledAction: 'Acción Programada',
      noAction: 'Sin Acción',
      actionNotDefined: 'Acción no definida',
      
      // MeasureImageDetails
      filter: 'Filtrar',
      sort: 'Ordenar',
      returnToInspectionMeasures: 'Volver a Medidas de Inspección',
      pdf: 'PDF',
      tiff: 'TIFF',
      optical: 'Óptico',
      max: 'Máx',
      images: 'Imágenes',
      thermalImage: 'Imagen Térmica',
      opticalImage: 'Imagen Óptica',
      information: 'Información',
      measureId: 'ID de Medida',
      camera: 'Cámara',
      inference: 'Inferencia',
      coordinates: 'Coordenadas',
      relativeHumidity: 'Humedad Relativa',
      wind: 'Viento',
      temperature: 'Temperatura',
      speed: 'Velocidad',
      detectedFeeders: 'Alimentadores Detectados',
      inspectionName: 'Nombre de Inspección',
      inspectionFeeder: 'Alimentador de Inspección',
      load: 'Carga',
      observations: 'Observaciones',
      actionDetails: 'Detalles de Acción',
      element: 'Elemento',
      opNumbers: 'Números de OP',
      tAbs: 'T Abs',
      tDelta: 'T Delta',
      finalAction: 'Acción Final',
      count: 'Recuento',
    },
  },
  pt: {
    translation: {
      // Common
      login: 'Entrar',
      logout: 'Sair',
      email: 'E-mail',
      password: 'Senha',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      create: 'Criar',
      search: 'Buscar',
      loading: 'Carregando...',
      
      // Navigation
      dashboard: 'Painel',
      profile: 'Perfil',
      clients: 'Clientes',
      inspections: 'Inspeções',
      uploadInspection: 'Enviar Inspeção',
      
      // Auth
      loginTitle: 'Bem-vindo de volta',
      loginSubtitle: 'Entre na sua conta',
      loginError: 'E-mail ou senha inválidos',
      
      // Profile
      profileTitle: 'Seu Perfil',
      fullName: 'Nome Completo',
      updateProfile: 'Atualizar Perfil',
      profileUpdated: 'Perfil atualizado com sucesso',
      
      // Clients (Admin)
      manageClients: 'Gerenciar Clientes',
      createClient: 'Criar Novo Cliente',
      clientName: 'Nome do Cliente',
      clientEmail: 'E-mail do Cliente',
      temporaryPassword: 'Senha Temporária',
      clientCreated: 'Cliente criado e e-mail enviado',
      
      // Inspections (Client)
      myInspections: 'Minhas Inspeções',
      uploadNew: 'Enviar Nova Inspeção',
      inspectionTitle: 'Título',
      inspectionDescription: 'Descrição',
      location: 'Localização',
      inspectionType: 'Tipo de Inspeção',
      status: 'Status',
      inspectionDate: 'Data da Inspeção',
      file: 'Arquivo',
      uploadSuccess: 'Inspeção enviada com sucesso',
      
      // Roles
      admin: 'Administrador',
      client: 'Cliente',
      role: 'Função',
      
      // Theme
      toggleTheme: 'Alternar tema',
      lightMode: 'Claro',
      darkMode: 'Escuro',
      systemMode: 'Sistema',
      
      // Dashboard
      dashboardTitle: 'Painel de Análise de Linhas Elétricas',
      dashboardSubtitle: 'Monitore e analise dados de inspeção de linhas elétricas em tempo real',
      welcomeMessage: 'Bem-vindo! Use a barra lateral para navegar até suas inspeções.',
      
      // Footer
      copyright: '© 2025 PowerScan Analytics. Todos os direitos reservados.',
      version: 'Versão 3.2.1',
      
      // Common UI
      main: 'Principal',
      createdAt: 'Criado em',
      date: 'Data',
      noInspections: 'Ainda não há inspeções',
      clientCreatedMock: 'Cliente criado com sucesso (dados de teste)',
      home: 'Início',
      comingSoon: 'Este recurso estará disponível em breve',

      // Inspections submenus
      distribution: 'Distribuição',
      transmission: 'Transmissão',

      // System submenus
      system: 'Sistema',
      elements: 'Elementos',
      lamps: 'Lâmpadas',
      cars: 'Veículos',
      actions: 'Ações',
      methods: 'Métodos',
      feeders: 'Alimentadores',
      eas: 'EAs',
      alarms: 'Alarmes',

      // MeasureDetails - Statistics
      statistics: 'Estatísticas',
      feederElementsVsInspectionMeasures: 'Elementos do Alimentador vs Medidas de Inspeção',
      inspectionStatistics: 'Estatísticas de Inspeção',
      feederName: 'Nome do Alimentador',
      feederLength: 'Comprimento do Alimentador',
      distanceTraveled: 'Distância percorrida',
      firstMeasure: 'Primeira medida',
      lastMeasure: 'Última medida',
      totalMeasures: 'Medidas totais',
      totalTime: 'Tempo total',
      dailyStatistics: 'Estatísticas Diárias',
      measuresCarThermographic: 'Medidas - Carro - Termográfico',
      show: 'Mostrar',
      entries: 'entradas',
      id: 'ID',
      address: 'ENDEREÇO',
      dateLabel: 'DATA',
      actionLabel: 'AÇÃO',
      hotspot: 'PONTO QUENTE',
      reprocessedAt: 'REPROCESSADO EM',
      actionColumn: 'Ações',
      open: 'Abrir',
      showing: 'Mostrando',
      of: 'de',
      to: 'para',
      previous: 'Anterior',
      next: 'Próximo',
      map: 'Mapa',
      mapVisualizationPlaceholder: 'Espaço reservado para visualização do mapa',
      allRightsReserved: 'Todos os direitos reservados',
      immediateAction: 'Ação Imediata',
      scheduledAction: 'Ação Programada',
      noAction: 'Sem Ação',
      actionNotDefined: 'Ação não definida',
      
      // MeasureImageDetails
      filter: 'Filtrar',
      sort: 'Ordenar',
      returnToInspectionMeasures: 'Retornar para Medidas de Inspeção',
      pdf: 'PDF',
      tiff: 'TIFF',
      optical: 'Óptico',
      max: 'Máx',
      images: 'Imagens',
      thermalImage: 'Imagem Térmica',
      opticalImage: 'Imagem Óptica',
      information: 'Informação',
      measureId: 'ID da Medida',
      camera: 'Câmera',
      inference: 'Inferência',
      coordinates: 'Coordenadas',
      relativeHumidity: 'Umidade Relativa',
      wind: 'Vento',
      temperature: 'Temperatura',
      speed: 'Velocidade',
      detectedFeeders: 'Alimentadores Detectados',
      inspectionName: 'Nome da Inspeção',
      inspectionFeeder: 'Alimentador de Inspeção',
      load: 'Carga',
      observations: 'Observações',
      actionDetails: 'Detalhes da Ação',
      element: 'Elemento',
      opNumbers: 'Números de OP',
      tAbs: 'T Abs',
      tDelta: 'T Delta',
      finalAction: 'Ação Final',
      count: 'Contagem',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
