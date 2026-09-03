// Testes da fusao de tres vias. Sem framework, de proposito:
//   node src/helpers/syncMerge.test.js
// Saida: uma linha por caso; falha imprime esperado x obtido e sai com 1.
import { mergeTaskLists, mergeMaps, mergeCustomLists, deepEqual } from "./syncMerge.js";

let failures = 0;

function check(name, actual, expected) {
  if (deepEqual(actual, expected)) {
    console.log(`ok   ${name}`);
  } else {
    failures += 1;
    console.log(`FALHA ${name}`);
    console.log(`  esperado: ${JSON.stringify(expected)}`);
    console.log(`  obtido:   ${JSON.stringify(actual)}`);
  }
}

function task(id, over = {}) {
  return {
    id,
    text: `tarefa ${id}`,
    checked: false,
    listId: "20260902",
    desc: "",
    subTaskList: [],
    color: "none",
    priority: 0,
    tags: [],
    time: null,
    alarm: false,
    repeatingEvent: null,
    ...over,
  };
}

// 1. Criacao dos dois lados: nada se perde, ordem local antes da remota.
{
  const base = [task("a")];
  const local = [task("a"), task("b")];
  const remote = [task("a"), task("c")];
  const merged = mergeTaskLists(base, local, remote);
  check("1 criacao dos dois lados", merged.map((t) => t.id), ["a", "b", "c"]);
}

// 2. Mesmo campo alterado dos dois lados: vence o maior updatedAt.
{
  const base = [task("a", { text: "original" })];
  const local = [task("a", { text: "local", updatedAt: 100, updatedBy: "dev-1" })];
  const remote = [task("a", { text: "remoto", updatedAt: 200, updatedBy: "dev-2" })];
  const merged = mergeTaskLists(base, local, remote);
  check("2 mesmo campo, maior updatedAt vence", merged[0].text, "remoto");

  // Empate de updatedAt desempata por deviceId, igual nos dois dispositivos.
  const localEmpate = [task("a", { text: "local", updatedAt: 100, updatedBy: "dev-1" })];
  const remoteEmpate = [task("a", { text: "remoto", updatedAt: 100, updatedBy: "dev-2" })];
  const A = mergeTaskLists(base, localEmpate, remoteEmpate);
  const B = mergeTaskLists(base, remoteEmpate, localEmpate);
  check("2 empate deterministico nos dois dispositivos", A[0].text, B[0].text);
  check("2 empate vence maior deviceId", A[0].text, "remoto");
}

// 3. Campos diferentes alterados dos dois lados: as duas mudancas sobrevivem.
{
  const base = [task("a")];
  const local = [task("a", { checked: true, updatedAt: 100, updatedBy: "dev-1" })];
  const remote = [task("a", { desc: "nota nova", updatedAt: 200, updatedBy: "dev-2" })];
  const merged = mergeTaskLists(base, local, remote);
  check("3 campos diferentes, checked local", merged[0].checked, true);
  check("3 campos diferentes, desc remota", merged[0].desc, "nota nova");
}

// 4. Apagado de um lado e alterado do outro: a alteracao vence.
{
  const base = [task("a"), task("b")];
  const local = [task("a"), task("b", { text: "editada", updatedAt: 100 })];
  const remote = [task("a")];
  const merged = mergeTaskLists(base, local, remote);
  check("4a apagado no remoto, alterado no local", merged.map((t) => t.id), ["a", "b"]);
  check("4a texto preservado", merged[1].text, "editada");

  const local2 = [task("a")];
  const remote2 = [task("a"), task("b", { text: "editada no remoto", updatedAt: 100 })];
  const merged2 = mergeTaskLists(base, local2, remote2);
  check("4b apagado no local, alterado no remoto", merged2.map((t) => t.id), ["a", "b"]);
}

// 5. Apagado dos dois lados: some de vez.
{
  const base = [task("a"), task("b")];
  const local = [task("a")];
  const remote = [task("a")];
  const merged = mergeTaskLists(base, local, remote);
  check("5 apagado dos dois lados", merged.map((t) => t.id), ["a"]);
}

// 6. Base ausente: tudo do servidor e criacao remota, nada e apagado.
{
  const local = [task("a")];
  const remote = [task("b")];
  const merged = mergeTaskLists(null, local, remote);
  check("6 base ausente nao apaga nada", merged.map((t) => t.id), ["a", "b"]);
}

// 7. Tarefa sem id vinda de instalacao antiga: nao quebra e nao duplica.
{
  const semId = { text: "antiga", checked: false, listId: "20260902" };
  const base = null;
  const local = [semId];
  const remote = [{ ...semId }];
  const merged = mergeTaskLists(base, local, remote);
  check("7 tarefa sem id nao duplica", merged.length, 1);
  check("7 tarefa sem id preservada", merged[0].text, "antiga");
}

// 8. Ordem: local preservada, remotas so no fim mantendo ordem relativa.
{
  const base = [];
  const local = [task("a"), task("b")];
  const remote = [task("x"), task("y")];
  const merged = mergeTaskLists(base, local, remote);
  check("8 ordem local depois remota", merged.map((t) => t.id), ["a", "b", "x", "y"]);
}

// 9. subTaskList e tratada como valor unico, nao fundida item a item.
{
  const base = [task("a", { subTaskList: [{ text: "s1", checked: false }] })];
  const local = [task("a", { subTaskList: [{ text: "s1", checked: true }], updatedAt: 300 })];
  const remote = [task("a", { subTaskList: [{ text: "s1", checked: false }, { text: "s2", checked: false }], updatedAt: 100 })];
  const merged = mergeTaskLists(base, local, remote);
  check("9 subTaskList valor unico", merged[0].subTaskList.length, 1);
}

// 10. Mapas: chave removida de um lado e inalterada no outro some.
{
  const base = { re1: true, re2: true };
  const local = { re1: true };
  const remote = { re1: true, re2: true };
  check("10 mapa remove chave apagada", mergeMaps(base, local, remote), { re1: true });
}

// 11. Listas personalizadas: fusao por listId.
{
  const base = [{ listId: "Projetos", listName: "Projetos" }];
  const local = [
    { listId: "Projetos", listName: "Projetos" },
    { listId: "Casa", listName: "Casa" },
  ];
  const remote = [
    { listId: "Projetos", listName: "Projetos" },
    { listId: "Trabalho", listName: "Trabalho" },
  ];
  const merged = mergeCustomLists(base, local, remote);
  check("11 listas personalizadas", merged.map((l) => l.listId), ["Projetos", "Casa", "Trabalho"]);
}

if (failures > 0) {
  console.log(`\n${failures} caso(s) falharam`);
  process.exit(1);
}
console.log("\ntodos os casos passaram");
