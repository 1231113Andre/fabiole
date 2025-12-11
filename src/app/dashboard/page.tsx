"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PersonalInfo {
  name: string;
  email: string;
  birthDate: string;
  phone?: string;
  height?: string;
  weight?: string;
  goals?: string;
  notes?: string;
  lastUpdate?: string;
}

interface Pesagem {
  data: string;
  peso: number;
  percentualMG: number;
  MM: number;
  H2O: number;
  IMC: number;
  gordVisceral: number;
  IDMetabolica: number;
  massaOssea: number;
  resultadoIMC: string;
  resultadoPercentualMG: string;
  notas?: string;
}

interface PerimetroCorporal {
  data: string;
  msDrt: number;
  msDrtCon: number;
  msEsq: number;
  msEsqCon: number;
  peito: number;
  cintura: number;
  abdominal: number;
  anca: number;
  miDrt: number;
  miEsq: number;
}

interface AvaliacaoFisica {
  data: string;
  flexoes1min: number;
  abdominais1min: number;
  milha: string;
  resultadoMilha: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [pesagens, setPesagens] = useState<Pesagem[]>([]);
  const [perimetros, setPerimetros] = useState<PerimetroCorporal[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoFisica[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    // TODO: Backend vai buscar dados da linha do utilizador no Google Sheets

    setTimeout(() => {
      // Dados simulados
      setPersonalInfo({
        name: "João Silva",
        email: "joao.silva@email.com",
        birthDate: "1990-01-15",
        phone: "+351 912 345 678",
        height: "175 cm",
        weight: "75 kg",
        goals: "Aumentar massa muscular e melhorar condicionamento físico",
        notes: "Seguir plano de treino semanal. Acompanhamento nutricional recomendado.",
        lastUpdate: "2024-01-15",
      });

      // Dados de exemplo para pesagens
      setPesagens([
        {
          data: "2024-01-15",
          peso: 75.5,
          percentualMG: 18.5,
          MM: 58.2,
          H2O: 45.3,
          IMC: 24.6,
          gordVisceral: 8,
          IDMetabolica: 38,
          massaOssea: 3.2,
          resultadoIMC: "Normal",
          resultadoPercentualMG: "Bom",
          notas: "Primeira avaliação",
        },
        {
          data: "2024-02-15",
          peso: 74.8,
          percentualMG: 17.8,
          MM: 58.5,
          H2O: 46.1,
          IMC: 24.4,
          gordVisceral: 7,
          IDMetabolica: 37,
          massaOssea: 3.2,
          resultadoIMC: "Normal",
          resultadoPercentualMG: "Bom",
        },
        {
          data: "2024-03-15",
          peso: 74.2,
          percentualMG: 17.2,
          MM: 59.1,
          H2O: 46.8,
          IMC: 24.2,
          gordVisceral: 7,
          IDMetabolica: 36,
          massaOssea: 3.3,
          resultadoIMC: "Normal",
          resultadoPercentualMG: "Excelente",
        },
      ]);

      // Dados de exemplo para perímetros
      setPerimetros([
        {
          data: "2024-01-15",
          msDrt: 32.5,
          msDrtCon: 30.2,
          msEsq: 32.3,
          msEsqCon: 30.0,
          peito: 105,
          cintura: 88,
          abdominal: 92,
          anca: 98,
          miDrt: 58,
          miEsq: 57.8,
        },
        {
          data: "2024-02-15",
          msDrt: 33.0,
          msDrtCon: 30.5,
          msEsq: 32.8,
          msEsqCon: 30.3,
          peito: 106,
          cintura: 87,
          abdominal: 91,
          anca: 98,
          miDrt: 58.5,
          miEsq: 58.2,
        },
      ]);

      // Dados de exemplo para avaliações físicas
      setAvaliacoes([
        {
          data: "2024-01-15",
          flexoes1min: 25,
          abdominais1min: 30,
          milha: "7:45",
          resultadoMilha: "Bom",
        },
        {
          data: "2024-02-15",
          flexoes1min: 28,
          abdominais1min: 32,
          milha: "7:30",
          resultadoMilha: "Bom",
        },
      ]);

      setIsLoading(false);
    }, 1000);

    // TODO: Verificar se utilizador está autenticado
  }, []);

  const handleLogout = () => {
    router.push("/login");
  };

  // Preparar dados para gráficos
  const chartData = pesagens.map((p) => ({
    data: new Date(p.data).toLocaleDateString("pt-PT", { month: "short", day: "numeric" }),
    peso: p.peso,
    massaGorda: p.percentualMG,
    massaMuscular: p.MM,
    gorduraVisceral: p.gordVisceral,
  }));

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
        <div className="container max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E90FF] mx-auto mb-4"></div>
              <p className="text-gray-600">A carregar informações...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32 pb-20">
      <div className="container max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                <span className="text-[#1E90FF]">Dashboard</span> do Cliente
              </h1>
              <p className="text-gray-600">
                Bem-vindo de volta! Aqui estão as tuas informações pessoais
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-300"
            >
              Sair
            </button>
          </div>
        </motion.div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Informações Pessoais</h2>
            {personalInfo?.lastUpdate && (
              <span className="text-sm text-gray-500">
                Última atualização: {new Date(personalInfo.lastUpdate).toLocaleDateString("pt-PT")}
              </span>
            )}
          </div>

          {personalInfo ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo</label>
                <p className="text-lg text-gray-800 font-semibold">{personalInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-lg text-gray-800">{personalInfo.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Data de Nascimento</label>
                <p className="text-lg text-gray-800">
                  {new Date(personalInfo.birthDate).toLocaleDateString("pt-PT")}
                </p>
              </div>
              {personalInfo.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
                  <p className="text-lg text-gray-800">{personalInfo.phone}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma informação disponível</p>
            </div>
          )}
        </motion.div>

        {/* Goals and Notes */}
        {(personalInfo?.goals || personalInfo?.notes) && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {personalInfo.goals && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Objetivos
                </h3>
                <p className="text-gray-700 leading-relaxed">{personalInfo.goals}</p>
              </motion.div>
            )}
            {personalInfo.notes && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl p-8 border border-orange-200 shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📝</span>
                  Notas do Personal Trainer
                </h3>
                <p className="text-gray-700 leading-relaxed">{personalInfo.notes}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Histórico de Pesagens */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Pesagens</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Peso (kg)</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">% MG</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MM (kg)</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">H2O</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">IMC</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Gord Visceral</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">ID Metabólica</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Massa Óssea (kg)</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Resultado IMC</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Resultado %MG</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Notas</th>
                </tr>
              </thead>
              <tbody>
                {pesagens.length > 0 ? (
                  pesagens.map((pesagem, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {new Date(pesagem.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.peso}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.percentualMG}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.MM}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.H2O}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.IMC}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.gordVisceral}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.IDMetabolica}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.massaOssea}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.resultadoIMC}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.resultadoPercentualMG}</td>
                      <td className="px-4 py-3 text-gray-800">{pesagem.notas || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma pesagem registada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Gráficos de Pesagens */}
        {pesagens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gráficos de Pesagens</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Peso */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Peso (kg)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="peso" stroke="#1E90FF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Massa Gorda */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Massa Gorda (%)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="massaGorda" stroke="#FF6B35" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Massa Muscular */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Massa Muscular (kg)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="massaMuscular" stroke="#28A745" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gordura Visceral */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Gordura Visceral</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="gorduraVisceral" stroke="#DC3545" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Perímetros Corporais */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Perímetros Corporais</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MS Drt</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MS Drt Con</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MS Esq</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MS Esq Con</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Peito</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Cintura</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Abdominal</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Anca</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MI Drt</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">MI Esq</th>
                </tr>
              </thead>
              <tbody>
                {perimetros.length > 0 ? (
                  perimetros.map((perimetro, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {new Date(perimetro.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.msDrt}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.msDrtCon}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.msEsq}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.msEsqCon}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.peito}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.cintura}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.abdominal}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.anca}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.miDrt}</td>
                      <td className="px-4 py-3 text-gray-800">{perimetro.miEsq}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      Nenhum perímetro registado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Avaliação Física */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Avaliação Física</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Flexões 1&apos;</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Abdominais 1&apos;</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Milha</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Resultado Milha</th>
                </tr>
              </thead>
              <tbody>
                {avaliacoes.length > 0 ? (
                  avaliacoes.map((avaliacao, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800">
                        {new Date(avaliacao.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{avaliacao.flexoes1min}</td>
                      <td className="px-4 py-3 text-gray-800">{avaliacao.abdominais1min}</td>
                      <td className="px-4 py-3 text-gray-800">{avaliacao.milha}</td>
                      <td className="px-4 py-3 text-gray-800">{avaliacao.resultadoMilha}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma avaliação registada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Tabelas de Referência */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-2xl p-8 border border-blue-200 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Tabelas de Referência</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Massa Gorda | Masculino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Massa Gorda | Masculino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">8-10%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">11-14%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">15-18%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;18%</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">11-13%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">14-17%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">18-22%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;22%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Massa Gorda | Feminino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Massa Gorda | Feminino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">16-19%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-24%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">25-29%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;29%</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">17-20%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">21-25%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">26-30%</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;30%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* IMC */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">IMC</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Classificação</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">IMC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">Magreza</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;18.5</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">Normal</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">18.5-24.9</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">Sobrepeso</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">25-29.9</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">Obesidade</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flexões 1' | Feminino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Flexões 1&apos; | Feminino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;20</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">15-19</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">10-14</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;10</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;18</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">13-17</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">8-12</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Flexões 1' | Masculino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Flexões 1&apos; | Masculino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;47</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">35-46</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">24-34</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;24</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;41</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-40</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Abdominais 1' | Feminino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Abdominais 1&apos; | Feminino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;35</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">26-34</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">18-25</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;18</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">22-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">15-21</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Abdominais 1' | Masculino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Abdominais 1&apos; | Masculino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;47</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">35-46</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">24-34</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;24</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;41</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-40</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teste da Milha | Feminino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Teste da Milha (1609m) | Feminino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;8:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">8:31-9:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">9:31-10:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;10:30</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;9:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">9:01-10:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">10:01-11:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;11:00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teste da Milha | Masculino */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Teste da Milha (1609m) | Masculino</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Idade</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Excelente</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Bom</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Médio</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">20-29</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;7:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">7:01-8:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">8:01-9:00</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;9:00</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">30-39</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&lt;7:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">7:31-8:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">8:31-9:30</td>
                      <td className="px-3 py-2 border border-gray-200 text-gray-800">&gt;9:30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-block text-[#1E90FF] hover:text-[#1E90FF]/80 font-semibold"
          >
            ← Voltar ao website
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
