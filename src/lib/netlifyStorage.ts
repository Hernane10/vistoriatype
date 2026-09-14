import JSZip from "jszip";

const NETLIFY_TOKEN = import.meta.env.VITE_NETLIFY_TOKEN;

export async function gerarLinkLaudo(htmlContent: string, nomeArquivo: string) {
  try {
    // 1. Cria o ZIP com o HTML e o arquivo _redirects
    const zip = new JSZip();
    
    // Coloca o index.html na RAIZ do ZIP
    zip.file("index.html", htmlContent);
    
    // Adiciona _redirects para garantir que a Netlify sirva como HTML
    zip.file("_redirects", "/* /index.html 200");
    
    // Gera o ZIP
    const zipBlob = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 }
    });
    
    // Cria um File com nome e tipo corretos
    const zipFile = new File([zipBlob], "laudo.zip", { type: "application/zip" });

    // 2. Gera um nome ÚNICO para o site
    const nomeSite = `vistoria-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log("Criando site:", nomeSite);

    // 3. Cria o site na Netlify
    const siteResponse = await fetch("https://api.netlify.com/api/v1/sites", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`,
        "Content-Type": "application/json",
      },
body: JSON.stringify({ 
  name: nomeSite,
  // Desativa o badge "Powered by Netlify"
  processing_settings: {
    skip_processing: false,
  },
  // Capabilities
  capabilities: {
    // Remove o badge
  },
}),
    });

    if (!siteResponse.ok) {
      const erroSite = await siteResponse.text();
      console.error("Erro ao criar site:", siteResponse.status, erroSite);
      throw new Error(`Erro ${siteResponse.status}: ${erroSite}`);
    }

    const site = await siteResponse.json();
    console.log("Site criado:", site.id, site.name);

    // 4. Faz o deploy do ZIP
    const formData = new FormData();
    formData.append("title", "Laudo gerado pelo app");
    formData.append("zip", zipFile);

    const deployResponse = await fetch(
      `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
        },
        body: formData,
      }
    );

    if (!deployResponse.ok) {
      const erroDeploy = await deployResponse.text();
      console.error("Erro no deploy:", deployResponse.status, erroDeploy);
      throw new Error(`Erro ${deployResponse.status} no deploy: ${erroDeploy}`);
    }

    const deploy = await deployResponse.json();
    console.log("Deploy criado:", deploy.ssl_url || deploy.url);

    return deploy.ssl_url || deploy.url;
  } catch (error: any) {
    console.error("Erro ao gerar link:", error);
    throw error;
  }
}