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
