migrate(
  (app) => {
    var cats = [
      { n: 'Espiritual', i: '🙏', c: '#9333ea' },
      { n: 'Parentes', i: '👪', c: '#2563eb' },
      { n: 'Conjugal', i: '💑', c: '#dc2626' },
      { n: 'Filhos', i: '🧒', c: '#f59e0b' },
      { n: 'Social', i: '👥', c: '#0891b2' },
      { n: 'Saúde', i: '💪', c: '#16a34a' },
      { n: 'Servir', i: '🤲', c: '#7c3aed' },
      { n: 'Intelectual', i: '📚', c: '#ea580c' },
      { n: 'Financeiro', i: '💰', c: '#059669' },
      { n: 'Profissional', i: '💼', c: '#4f46e5' },
      { n: 'Emocional', i: '❤️', c: '#e11d48' },
    ]
    var catMap = {}
    cats.forEach(function (cat, idx) {
      try {
        catMap[cat.n] = app.findFirstRecordByData('life_wheel_categories', 'name', cat.n).id
      } catch (_) {
        var col = app.findCollectionByNameOrId('life_wheel_categories')
        var rec = new Record(col)
        rec.set('name', cat.n)
        rec.set('icon', cat.i)
        rec.set('color', cat.c)
        rec.set('order', idx)
        app.save(rec)
        catMap[cat.n] = rec.id
      }
    })
    var qs = [
      [
        'Espiritual',
        'Você mantém uma prática espiritual constante que traz paz interior?',
        'Considere se você reserva momentos regulares para práticas espirituais como meditação, oração ou reflexão que lhe trazem serenidade.',
      ],
      [
        'Espiritual',
        'Sente conexão com algo maior que você?',
        'Avalie seu senso de conexão com Deus, o Universo ou uma força superior que transcende o material.',
      ],
      [
        'Espiritual',
        'Vive alinhado com seus valores e princípios espirituais?',
        'Reflita se suas ações diárias estão em harmonia com seus valores espirituais mais profundos.',
      ],
      [
        'Espiritual',
        'Reserva tempo para meditação, oração ou reflexão?',
        'Considere a frequência e qualidade do tempo dedicado ao silêncio interior e conexão espiritual.',
      ],
      [
        'Espiritual',
        'Sente gratidão pela vida regularmente?',
        'Avalie se você pratica a gratidão como um hábito diário, reconhecendo as bênçãos em sua vida.',
      ],
      [
        'Espiritual',
        'Encontra sentido e propósito em sua existência?',
        'Reflita sobre o sentido da sua vida e se você sente que sua existência tem propósito.',
      ],
      [
        'Parentes',
        'Você tem um relacionamento saudável com seus pais?',
        'Avalie a qualidade do vínculo com seus pais ou figuras parentais, considerando respeito e afeto.',
      ],
      [
        'Parentes',
        'Mantém contato frequente com seus familiares?',
        'Considere a regularidade e qualidade das interações com membros da sua família.',
      ],
      [
        'Parentes',
        'Sente-se apoiado por sua família em momentos difíceis?',
        'Reflita sobre o suporte emocional e prático que recebe da família em momentos de necessidade.',
      ],
      [
        'Parentes',
        'Resolve conflitos familiares de forma construtiva?',
        'Avalie sua capacidade de dialogar e resolver desentendimentos sem romper vínculos familiares.',
      ],
      [
        'Parentes',
        'Sente amor e respeito mútuo com seus parentes?',
        'Considere se há expressões de afeto e respeito recíproco nas relações familiares.',
      ],
      [
        'Parentes',
        'Participa de momentos importantes da família?',
        'Reflita sobre sua presença em celebrações, datas comemorativas e eventos familiares significativos.',
      ],
      [
        'Conjugal',
        'Você está satisfeito com seu relacionamento amoroso?',
        'Avalie o nível geral de satisfação com sua vida afetiva e parceria.',
      ],
      [
        'Conjugal',
        'Comunica-se abertamente com seu parceiro(a)?',
        'Considere a qualidade do diálogo, sinceridade e escuta na relação.',
      ],
      [
        'Conjugal',
        'Sente intimidade e conexão emocional com seu parceiro(a)?',
        'Reflita sobre a proximidade emocional, afeto e cumplicidade no relacionamento.',
      ],
      [
        'Conjugal',
        'Divide responsabilidades de forma equilibrada com seu parceiro(a)?',
        'Avalie se tarefas e decisões são compartilhadas de maneira justa.',
      ],
      [
        'Conjugal',
        'Sente que seu relacionamento está crescendo e evoluindo?',
        'Considere se há evolução, amadurecimento e projetos compartilhados na relação.',
      ],
      [
        'Filhos',
        'Você tem uma boa comunicação com seus filhos?',
        'Avalie a qualidade do diálogo e escuta com seus filhos em diferentes situações.',
      ],
      [
        'Filhos',
        'Passa tempo de qualidade com seus filhos?',
        'Considere a quantidade e qualidade do tempo dedicado exclusivamente aos filhos.',
      ],
      [
        'Filhos',
        'Sabe estabelecer limites com amor e firmeza?',
        'Reflita sobre sua capacidade de impor disciplina com afeto e consistência.',
      ],
      [
        'Filhos',
        'Sente-se presente na vida dos seus filhos?',
        'Avalie seu nível de envolvimento nas atividades e momentos importantes dos filhos.',
      ],
      [
        'Filhos',
        'Reconhece e valoriza as conquistas dos seus filhos?',
        'Considere se você celebra e incentiva as vitórias e esforços dos seus filhos.',
      ],
      [
        'Social',
        'Você tem amigos verdadeiros em quem pode confiar?',
        'Avalie a qualidade das suas amizades e se há pessoas em quem pode se apoiar.',
      ],
      [
        'Social',
        'Sente-se confortável em ambientes sociais?',
        'Considere sua facilidade e bem-estar ao interagir em grupos e eventos sociais.',
      ],
      [
        'Social',
        'Mantém contato regular com amigos?',
        'Reflita sobre a frequência das interações com seu círculo de amizades.',
      ],
      [
        'Social',
        'Participa de grupos ou comunidades que agregam valor?',
        'Avalie seu envolvimento em comunidades, clubes ou grupos de interesse pessoal.',
      ],
      [
        'Social',
        'Sente-se aceito e valorizado socialmente?',
        'Considere se sente pertencimento e reconhecimento nos grupos dos quais participa.',
      ],
      [
        'Social',
        'Consegue fazer novas amizades com facilidade?',
        'Reflita sobre sua capacidade de iniciar e cultivar novas relações de amizade.',
      ],
      [
        'Saúde',
        'Você pratica atividade física regularmente?',
        'Avalie a frequência e consistência dos exercícios físicos na sua rotina.',
      ],
      [
        'Saúde',
        'Alimenta-se de forma saudável e equilibrada?',
        'Considere a qualidade nutricional da sua alimentação e seus hábitos alimentares.',
      ],
      [
        'Saúde',
        'Dorme o suficiente e com qualidade?',
        'Reflita sobre a duração e qualidade do seu sono diário.',
      ],
      [
        'Saúde',
        'Faz exames de saúde preventivos regularmente?',
        'Avalie se mantém check-ups e consultas médicas em dia.',
      ],
      [
        'Saúde',
        'Mantém um peso adequado para sua altura?',
        'Considere se seu peso está dentro de parâmetros saudáveis.',
      ],
      [
        'Saúde',
        'Sente disposição e energia no dia a dia?',
        'Reflita sobre seu nível de vitalidade e energia para as atividades diárias.',
      ],
      [
        'Servir',
        'Você ajuda outras pessoas de forma desinteressada?',
        'Avalie sua disposição para auxiliar os outros sem esperar nada em troca.',
      ],
      [
        'Servir',
        'Participa de atividades voluntárias ou comunitárias?',
        'Considere seu envolvimento em ações voluntárias ou causas sociais.',
      ],
      [
        'Servir',
        'Sente que sua vida impacta positivamente os outros?',
        'Reflita sobre como suas ações contribuem para o bem-estar das pessoas ao seu redor.',
      ],
      [
        'Servir',
        'Compartilha seu conhecimento e experiência com quem precisa?',
        'Avalie se você transmite seus saberes para ajudar outras pessoas a crescerem.',
      ],
      [
        'Servir',
        'Está disponível para apoiar amigos e familiares em necessidade?',
        'Considere sua disponibilidade emocional e prática para apoiar quem precisa.',
      ],
      [
        'Servir',
        'Sente alegria ao contribuir para o bem-estar dos outros?',
        'Reflita sobre o prazer e satisfação que sente ao ajudar o próximo.',
      ],
      [
        'Intelectual',
        'Você lê livros ou assiste a conteúdos que ampliam seu conhecimento?',
        'Avalie a frequência e qualidade do seu consumo de conteúdo educacional.',
      ],
      [
        'Intelectual',
        'Busca aprender coisas novas regularmente?',
        'Considere sua curiosidade e iniciativa para adquirir novos conhecimentos.',
      ],
      [
        'Intelectual',
        'Mantém a curiosidade e o desejo de aprender vivo?',
        'Reflita sobre seu interesse contínuo em descobrir e explorar novos temas.',
      ],
      [
        'Intelectual',
        'Estuda ou aprimora habilidades relacionadas ao seu interesse?',
        'Avalie se dedica tempo ao aprimoramento de habilidades específicas.',
      ],
      [
        'Intelectual',
        'Sente-se mentalmente estimulado e desafiado?',
        'Considere se sua rotina inclui atividades que desafiam e estimulam sua mente.',
      ],
      [
        'Financeiro',
        'Você tem controle sobre suas finanças pessoais?',
        'Avalie se conhece e gerencia suas receitas e despesas de forma organizada.',
      ],
      [
        'Financeiro',
        'Possui reservas financeiras para emergências?',
        'Considere se tem uma reserva de segurança para imprevistos.',
      ],
      [
        'Financeiro',
        'Paga suas contas em dia sem dificuldades?',
        'Reflita sobre sua pontualidade e facilidade em honrar compromissos financeiros.',
      ],
      [
        'Financeiro',
        'Investe em seu futuro financeiro?',
        'Avalie se aplica recursos em investimentos ou poupança para o futuro.',
      ],
      [
        'Financeiro',
        'Sente-se seguro em relação ao seu dinheiro?',
        'Considere seu nível de tranquilidade quanto à estabilidade financeira.',
      ],
      [
        'Financeiro',
        'Seu rendimento financeiro atende às suas necessidades?',
        'Reflita se sua renda é suficiente para cobrir suas necessidades e desejos.',
      ],
      [
        'Profissional',
        'Você está satisfeito com sua carreira ou trabalho atual?',
        'Avalie o nível geral de satisfação com sua vida profissional.',
      ],
      [
        'Profissional',
        'Sente-se realizado profissionalmente?',
        'Considere se seu trabalho traz sentido e realização pessoal.',
      ],
      [
        'Profissional',
        'Tem um bom relacionamento com colegas de trabalho?',
        'Reflita sobre a qualidade das interações no ambiente profissional.',
      ],
      [
        'Profissional',
        'Vê oportunidades de crescimento em sua carreira?',
        'Avalie se existem perspectivas de evolução e desenvolvimento profissional.',
      ],
      [
        'Profissional',
        'Seu trabalho está alinhado com seus valores pessoais?',
        'Considere se sua atividade profissional reflete seus princípios e valores.',
      ],
      [
        'Profissional',
        'Sente reconhecimento e valorização no trabalho?',
        'Reflita sobre o feedback e valorização que recebe no ambiente profissional.',
      ],
      [
        'Emocional',
        'Você se sente capaz de lidar com suas emoções de forma saudável?',
        'Avalie sua capacidade de reconhecer, expressar e gerenciar suas emoções.',
      ],
      [
        'Emocional',
        'Pratica a autorreflexão e o autoconhecimento?',
        'Considere se reserva tempo para refletir sobre si mesmo e seus sentimentos.',
      ],
      [
        'Emocional',
        'Sente alegria e felicidade na maior parte do tempo?',
        'Reflita sobre a frequência de emoções positivas no seu dia a dia.',
      ],
      [
        'Emocional',
        'Lida bem com o estresse e a ansiedade?',
        'Avalie suas estratégias e eficácia no enfrentamento de situações estressantes.',
      ],
      [
        'Emocional',
        'Mantém uma atitude positiva diante dos desafios?',
        'Considere sua resiliência e otimismo frente às adversidades.',
      ],
      [
        'Emocional',
        'Sente amor próprio e aceitação de quem você é?',
        'Reflita sobre seu nível de autoestima e aceitação da sua própria identidade.',
      ],
    ]
    var perCatOrder = {}
    qs.forEach(function (q) {
      var catName = q[0]
      var order = perCatOrder[catName] || 0
      try {
        app.findFirstRecordByData('life_wheel_questions', 'text', q[1])
      } catch (_) {
        var qCol = app.findCollectionByNameOrId('life_wheel_questions')
        var qRec = new Record(qCol)
        qRec.set('text', q[1])
        qRec.set('explanation', q[2])
        qRec.set('category', catMap[catName])
        qRec.set('order', order)
        app.save(qRec)
      }
      perCatOrder[catName] = order + 1
    })
  },
  (app) => {},
)
