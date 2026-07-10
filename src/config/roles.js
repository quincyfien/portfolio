export const ROLES = {
  cybersecurity: {
    label: 'Cybersecurity',
    pageTitle: 'NDICHIA QUINCY FIEN | Cybersecurity Portfolio',
    cvPath: '/assets/documents/CV_Ndichia_Quincy_Cybersecurity.docx',
    sections: ['home', 'about', 'skills', 'projects', 'journey', 'blog', 'contact'],
    defaultSkillTab: 'cybersecurity',
    defaultProjectFilter: 'Cybersecurity',
  },
  dev: {
    label: 'Full-Stack Developer',
    pageTitle: 'NDICHIA QUINCY FIEN | Full-Stack Developer Portfolio',
    cvPath: '/assets/documents/CV_Ndichia_Quincy_Developer.docx',
    sections: ['home', 'about', 'skills', 'services', 'projects', 'blog', 'contact'],
    defaultSkillTab: 'development',
    defaultProjectFilter: 'Web Development',
  },
  writer: {
    label: 'Technical Writer',
    pageTitle: 'NDICHIA QUINCY FIEN | Technical Writer Portfolio',
    cvPath: '/assets/documents/CV_Ndichia_Quincy_Writer.docx',
    sections: ['home', 'about', 'skills', 'services', 'blog', 'contact'],
    defaultSkillTab: 'business',
    defaultProjectFilter: null,
  },
};

export const ALL_SECTIONS = ['home', 'about', 'skills', 'services', 'projects', 'journey', 'blog', 'contact'];

export function getRoleConfig() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get('role');
  return role ? ROLES[role] || null : null;
}
