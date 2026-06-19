import api from '../../lib/api';

export const fileService = {
  uploadFile: async (uri: string, type: string, fileName: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type,
      name: fileName,
    } as any);

    const res = await api.post('/files/upload', formData);
    return res.data;
  }
};
