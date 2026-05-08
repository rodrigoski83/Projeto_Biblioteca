import React, { useEffect, useState } from 'react';

function App() {
  // --- 1. ESTADOS ---
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [modoAdmin, setModoAdmin] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');

  const [emprestandoId, setEmprestandoId] = useState(null);
  const [nomeAluno, setNomeAluno] = useState('');
  const [serie, setSerie] = useState('');
  const [dataEmprestimo, setDataEmprestimo] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');

  // --- 2. FUNÇÕES ---
  const buscarLivros = () => {
    fetch('https://projeto-biblioteca-u68j.onrender.com/livros')
      .then(res => res.json())
      .then(data => setLivros(data));
  };

  useEffect(() => { buscarLivros(); }, []);

  const gerenciarAcessoAdmin = () => {
    if (modoAdmin) {
      setModoAdmin(false);
    } else {
      const senha = prompt("Digite a senha do Bibliotecário:");
      if (senha === "Univesp2026") { 
        setModoAdmin(true);
      } else {
        alert("Senha incorreta!");
      }
    }
  };

  const cadastrarLivro = (e) => {
    e.preventDefault();
    fetch('https://projeto-biblioteca-u68j.onrender.com/livros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, autor, categoria: novaCategoria })
    }).then(() => { 
      buscarLivros(); 
      setTitulo(''); setAutor(''); setNovaCategoria(''); 
    });
  };

  const realizarEmprestimo = (e) => {
    e.preventDefault();
    fetch(`https://projeto-biblioteca-u68j.onrender.com/livros/emprestar/${emprestandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_nome: nomeAluno, serie, data_emprestimo: dataEmprestimo, data_devolucao: dataDevolucao })
    }).then(() => { 
      buscarLivros(); 
      setEmprestandoId(null); setNomeAluno(''); setSerie(''); setDataEmprestimo(''); setDataDevolucao(''); 
    });
  };

  const realizarDevolucao = (id) => {
    if (window.confirm("Confirmar a devolução deste livro?")) {
      fetch(`https://projeto-biblioteca-u68j.onrender.com/livros/devolver/${id}`, { method: 'PUT' })
        .then(() => buscarLivros());
    }
  };

  const deletarLivro = (id) => {
    if (window.confirm("ATENÇÃO: Deseja excluir este livro permanentemente do acervo?")) {
      fetch(`https://projeto-biblioteca-u68j.onrender.com/livros/${id}`, { method: 'DELETE' })
        .then(() => buscarLivros());
    }
  };

  // --- 3. LÓGICA DE FILTRO ---
  const categoriasExistentes = ['Todos', ...new Set(livros.map(l => l.categoria).filter(Boolean))];
  const livrosFiltrados = livros.filter(livro => {
    const matchesBusca = livro.titulo.toLowerCase().includes(busca.toLowerCase()) || 
                         livro.autor.toLowerCase().includes(busca.toLowerCase());
    const matchesCategoria = categoriaAtiva === 'Todos' || livro.categoria === categoriaAtiva;
    return matchesBusca && matchesCategoria;
  });

  // Cálculos para o contador
  const totalLivros = livros.length;
  const emprestados = livros.filter(l => l.usuario_nome).length;
  const disponiveis = totalLivros - emprestados;

  // --- 4. VISUAL ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f4f7f6' }}>
      
      {/* MENU LATERAL */}
      <div style={{ width: '220px', background: '#2c3e50', color: 'white', padding: '20px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2em', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Categorias</h2>
        {categoriasExistentes.map(cat => (
          <div 
            key={cat} 
            onClick={() => setCategoriaAtiva(cat)} 
            style={{ 
              padding: '12px', 
              cursor: 'pointer', 
              background: categoriaAtiva === cat ? '#3498db' : 'transparent', 
              borderRadius: '4px', 
              marginBottom: '5px',
              transition: '0.2s'
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ flex: 1, padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>📚 Sistema de Biblioteca </h1> 
          <button 
            onClick={gerenciarAcessoAdmin} 
            style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: modoAdmin ? '#e74c3c' : '#2ecc71', color: 'white', fontWeight: 'bold' }}
          >
            {modoAdmin ? "🔓 Sair do Modo Admin" : "🔐 Acesso Bibliotecário"}
          </button>
        </div>

        {/* --- BLOCO DE CONTADORES --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <div style={{ flex: 1, background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #3498db' }}>
            <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold' }}>TOTAL ACERVO</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{totalLivros}</h2>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #f1c40f' }}>
            <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold' }}>EMPRESTADOS</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{emprestados}</h2>
          </div>
          <div style={{ flex: 1, background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #2ecc71' }}>
            <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 'bold' }}>DISPONÍVEIS</span>
            <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{disponiveis}</h2>
          </div>
        </div>

        {/* BARRA DE PESQUISA */}
        <input 
          type="text" 
          placeholder="🔍 Pesquisar por título ou autor..." 
          value={busca} 
          onChange={(e) => setBusca(e.target.value)} 
          style={{ width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }} 
        />

        {/* PAINEL DE CADASTRO (SÓ ADMIN) */}
        {modoAdmin && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '25px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{marginTop: 0}}>Cadastrar Novo Livro</h3>
            <form onSubmit={cadastrarLivro} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
              <input placeholder="Autor" value={autor} onChange={e => setAutor(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
              <input placeholder="Categoria (ex: Romance)" value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} required style={{ padding: '8px', flex: 1 }} />
              <button type="submit" style={{ padding: '8px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar</button>
            </form>
          </div>
        )}

        {/* LISTAGEM DOS LIVROS */}
        <div style={{ display: 'grid', gap: '15px' }}>
          {livrosFiltrados.map(livro => (
            <div 
              key={livro.id} 
              style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '8px', 
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
                borderLeft: livro.usuario_nome ? '6px solid #f1c40f' : '6px solid #2ecc71' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7em', background: '#eee', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold', color: '#666' }}>{livro.categoria || 'Geral'}</span>
                  <h3 style={{ margin: '10px 0 5px 0' }}>{livro.titulo}</h3>
                  <p style={{ margin: 0, color: '#666' }}>{livro.autor}</p>

                  {livro.usuario_nome ? (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fef9e7', borderRadius: '5px', border: '1px solid #f9e79f', fontSize: '0.9em' }}>
                      <p style={{ margin: '2px 0' }}>👤 <strong>Aluno:</strong> {livro.usuario_nome} ({livro.serie})</p>
                      <p style={{ margin: '2px 0' }}>📅 <strong>Retirada:</strong> {new Date(livro.data_emprestimo).toLocaleDateString()}</p>
                      <p style={{ margin: '2px 0' }}>🚩 <strong>Devolução:</strong> {new Date(livro.data_devolucao).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <p style={{ marginTop: '15px', color: '#27ae60', fontWeight: 'bold', fontSize: '0.9em' }}>✅ Disponível na estante</p>
                  )}
                </div>

                {modoAdmin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!livro.usuario_nome ? (
                      <button onClick={() => setEmprestandoId(livro.id)} style={{ padding: '8px 15px', background: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Emprestar</button>
                    ) : (
                      <button onClick={() => realizarDevolucao(livro.id)} style={{ padding: '8px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Devolver</button>
                    )}
                    <button onClick={() => deletarLivro(livro.id)} style={{ padding: '8px 15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' }}>🗑️ Excluir</button>
                  </div>
                )}
              </div>

              {emprestandoId === livro.id && (
                <form onSubmit={realizarEmprestimo} style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <input placeholder="Nome do Aluno" value={nomeAluno} onChange={e => setNomeAluno(e.target.value)} required style={{ padding: '8px', flex: '1 1 200px' }} />
                  <input placeholder="Série" value={serie} onChange={e => setSerie(e.target.value)} required style={{ padding: '8px', width: '100px' }} />
                  <label>Retirada: <input type="date" value={dataEmprestimo} onChange={e => setDataEmprestimo(e.target.value)} required /></label>
                  <label>Devolução: <input type="date" value={dataDevolucao} onChange={e => setDataDevolucao(e.target.value)} required /></label>
                  <button type="submit" style={{ padding: '8px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmar</button>
                  <button type="button" onClick={() => setEmprestandoId(null)} style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #ccc' }}>Cancelar</button>
                </form>
              )}
            </div>
          ))}
          {livrosFiltrados.length === 0 && <p style={{textAlign: 'center', color: '#999'}}>Nenhum livro encontrado.</p>}
        </div>
      </div>
    </div>
  );
}

export default App;