<script lang="ts">
  import { cultivationQuestions, cultivationRealms, type CultivationQuestion } from "@/data/tests/cultivation";

  const STORAGE_KEY = "cultivation_answers";
  const ORDER_KEY = "cultivation_order";
  const CN_NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

  const DRAW = { single: 10, judge: 8, sort: 2 };
  const DRAW_TOTAL = DRAW.single + DRAW.judge + DRAW.sort;

  type AnswerValue = number | boolean | number[] | null;
  interface WrongItem { q: CultivationQuestion; user: AnswerValue }
  interface ResultData {
    score: number; correct: number;
    singleScore: number; judgeScore: number; sortScore: number;
    wrong: WrongItem[];
  }

  // ===== 洗牌 =====
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===== 抽卷（从 localStorage 恢复或重新抽） =====
  function loadOrder(): number[] {
    try {
      const saved = localStorage.getItem(ORDER_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length === DRAW_TOTAL) return arr;
      }
    } catch { /* ignore */ }
    const poolOf = (type: CultivationQuestion["type"]) =>
      cultivationQuestions.filter((q) => q.type === type);
    const draw = (pool: CultivationQuestion[], n: number) =>
      shuffle(pool.map((_, i) => i)).slice(0, n).map((i) => pool[i]);
    const drawn = [
      ...draw(poolOf("single"), DRAW.single),
      ...draw(poolOf("judge"), DRAW.judge),
      ...draw(poolOf("sort"), DRAW.sort),
    ];
    const order = shuffle(drawn).map((q) => q.id - 1);
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch { /* ignore */ }
    return order;
  }

  // ===== 状态 =====
  let order = loadOrder();
  let QUESTIONS: CultivationQuestion[] = order.map((i) => cultivationQuestions[i]);
  let TOTAL = QUESTIONS.length;
  let current = 0;
  let answers: AnswerValue[] = loadAnswers();
  let sortOrder: number[] = Array.isArray(answers[0]) ? [...(answers[0] as number[])] : [];
  let showResult = false;

  function loadAnswers(): AnswerValue[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length === TOTAL) return arr;
      }
    } catch { /* ignore */ }
    return new Array(TOTAL).fill(null);
  }

  function saveAnswers() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* ignore */ }
  }

  // ===== 答题操作 =====
  function selectOption(value: string) {
    const v = value === "true" ? true : value === "false" ? false : parseInt(value, 10);
    answers[current] = v;
    answers = [...answers];
    saveAnswers();
  }

  function toggleSort(idx: number) {
    const pos = sortOrder.indexOf(idx);
    if (pos >= 0) sortOrder.splice(pos, 1);
    else sortOrder.push(idx);
    sortOrder = [...sortOrder];
    answers[current] = [...sortOrder];
    answers = [...answers];
    saveAnswers();
  }

  function goPrev() {
    if (current <= 0) return;
    current -= 1;
    const saved = answers[current];
    sortOrder = Array.isArray(saved) ? [...(saved as number[])] : [];
  }

  function goNext() {
    if (current >= TOTAL - 1) return;
    current += 1;
    const saved = answers[current];
    sortOrder = Array.isArray(saved) ? [...(saved as number[])] : [];
  }

  function submit() {
    const skipped = answers.filter((a) => a === null).length;
    if (skipped > 0 && !confirm(`还有 ${skipped} 题未作答，将计 0 分。确认交卷？`)) return;
    showResult = true;
  }

  function restart() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem(ORDER_KEY); } catch { /* ignore */ }
    location.reload();
  }

  // ===== 派生状态 =====
  $: q = QUESTIONS[current];
  $: progress = Math.round((current / TOTAL) * 100);
  $: isLast = current >= TOTAL - 1;

  // ===== 判分 =====
  function calculate(): ResultData {
    const result: ResultData = { score: 0, correct: 0, singleScore: 0, judgeScore: 0, sortScore: 0, wrong: [] };
    QUESTIONS.forEach((qq, i) => {
      const a = answers[i];
      let isCorrect = false;
      if (qq.type === "single") {
        isCorrect = a !== null && a === qq.answer;
        if (isCorrect) result.singleScore += 5;
      } else if (qq.type === "judge") {
        isCorrect = a !== null && a === qq.answer;
        if (isCorrect) result.judgeScore += 5;
      } else {
        isCorrect = Array.isArray(a) && a.length === qq.answer.length && a.every((v, j) => v === qq.answer[j]);
        if (isCorrect) result.sortScore += 5;
      }
      if (isCorrect) { result.score += 5; result.correct += 1; }
      else result.wrong.push({ q: qq, user: a });
    });
    return result;
  }

  $: result = showResult ? calculate() : null;

  // ===== 境界判定 =====
  function realmLabel(score: number): string {
    const idx = Math.floor(score / 10);
    const realm = cultivationRealms[idx] ?? cultivationRealms[0];
    const level = score % 10;
    if (idx === 0) return "凡人之躯";
    if (level === 0 || idx === cultivationRealms.length - 1) return realm.name;
    return `${realm.name}期 ${CN_NUM[level]}重`;
  }

  function answerText(qq: CultivationQuestion, a: AnswerValue): string {
    if (a === null || a === undefined) return "未答";
    if (qq.type === "single" && typeof a === "number") return qq.options[a];
    if (qq.type === "judge" && typeof a === "boolean") return a ? "对" : "错";
    if (qq.type === "sort" && Array.isArray(a)) return a.map((i) => qq.items[i]).join(" → ");
    return "未答";
  }

  // ===== 复制成绩单 =====
  async function copyResult() {
    if (!result) return;
    const text = [
      "【修仙境界测试】",
      `成绩：${result.score} / 100（答对 ${result.correct}/${TOTAL} 题）`,
      `境界：${realmLabel(result.score)} · ${cultivationRealms[Math.floor(result.score / 10)]?.verdict ?? ""}`,
      `单选 ${result.singleScore}/50，判断 ${result.judgeScore}/40，排序 ${result.sortScore}/10`,
      result.wrong.length > 0 ? `错题 ${result.wrong.length} 道，道友共勉。` : "全对，望道友早日飞升。",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      alert("复制失败，请手动选择文字复制");
    }
  }
</script>

{#if showResult && result}
  <!-- ============ 结果视图 ============ -->
  <div class="card-base p-6 md:p-8">
    <h2 class="text-2xl font-bold mb-1 text-center">天机已定</h2>
    <div class="text-center text-5xl font-bold mb-1 text-amber-500">
      {result.score} <span class="text-base text-neutral-400">/ 100</span>
    </div>
    <div class="text-center text-sm text-neutral-500 mb-2">答对 {result.correct} / {TOTAL} 题</div>
    <div class="text-center text-3xl font-bold my-3 text-indigo-700 dark:text-indigo-300">
      {realmLabel(result.score)}
    </div>
    <div class="text-center text-sm text-neutral-600 dark:text-neutral-400 mb-6">
      「{cultivationRealms[Math.floor(result.score / 10)]?.verdict ?? ""}」
    </div>

    <div class="flex flex-wrap justify-center gap-2 mb-6 text-xs">
      <span class="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600">单选 {result.singleScore}/50</span>
      <span class="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600">判断 {result.judgeScore}/40</span>
      <span class="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600">排序 {result.sortScore}/10</span>
    </div>

    {#if result.wrong.length > 0}
      <div class="mb-6">
        <h3 class="font-bold mb-3">📜 错题回顾</h3>
        <div class="flex flex-col gap-3">
          {#each result.wrong as w}
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
              <div class="text-sm font-medium mb-2">{w.q.id}. {w.q.text}</div>
              <div class="text-xs space-y-1">
                <div class="text-red-500">你的答案：{answerText(w.q, w.user)}</div>
                <div class="text-green-600">正确答案：{answerText(w.q, w.q.answer)}</div>
                <div class="text-neutral-500 pt-1">解析：{w.q.explain}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center text-sm text-amber-600 mb-6">🎉 全对！道途无碍，可往飞升。</div>
    {/if}

    <div class="flex flex-wrap gap-3 justify-center">
      <button on:click={copyResult} class="btn-regular px-5 py-2 text-sm">📋 复制成绩单</button>
      <button on:click={restart} class="btn-regular px-5 py-2 text-sm">🔄 再测一次</button>
    </div>
  </div>
{:else if q}
  <!-- ============ 答题视图 ============ -->
  <div class="relative rounded-2xl overflow-hidden bg-gradient-to-b from-stone-950 via-zinc-900 to-neutral-900 p-6 md:p-8">
    <div class="pointer-events-none absolute inset-0" style="background: radial-gradient(60% 40% at 50% 0%, rgba(251,191,36,0.16), transparent);"></div>
    <div class="relative">
      <div class="flex justify-between text-xs text-amber-200/70 mb-2">
        <span>试炼第 {current + 1} / {TOTAL} 重</span>
        <span>{progress}%</span>
      </div>
      <div class="w-full h-2 bg-white/10 rounded-full mb-1">
        <div
          class="h-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
          style="width: {progress}%"
        ></div>
      </div>
      <div class="text-[10px] text-white/40 mb-6 text-right">练气 · 筑基 · 金丹 · 元婴 · 化神 · 炼虚 · 合体 · 大乘 · 渡劫 · 飞升</div>

      <div class="text-lg md:text-xl font-bold text-white mb-6 leading-relaxed">{q.text}</div>

      <!-- 单选 -->
      {#if q.type === "single"}
        <div class="grid gap-3">
          {#each q.options as opt, i}
            <button
              on:click={() => selectOption(String(i))}
              class="flex items-center gap-2 text-left px-4 py-3 rounded-xl border transition text-sm {answers[current] === i
                ? 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'border-white/20 bg-white/5 text-neutral-200 hover:border-amber-300/60 hover:bg-white/10'}"
            >
              <span class="w-6 text-amber-300/70">{String.fromCharCode(65 + i)}</span>{opt}
            </button>
          {/each}
        </div>
      {/if}

      <!-- 判断 -->
      {#if q.type === "judge"}
        <div class="grid grid-cols-2 gap-3">
          <button
            on:click={() => selectOption("true")}
            class="px-4 py-4 rounded-xl border transition text-sm font-medium {answers[current] === true
              ? 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
              : 'border-white/20 bg-white/5 text-neutral-200 hover:border-amber-300/60 hover:bg-white/10'}"
          >对 · 真道法</button>
          <button
            on:click={() => selectOption("false")}
            class="px-4 py-4 rounded-xl border transition text-sm font-medium {answers[current] === false
              ? 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
              : 'border-white/20 bg-white/5 text-neutral-200 hover:border-amber-300/60 hover:bg-white/10'}"
          >错 · 伪道法</button>
        </div>
      {/if}

      <!-- 排序 -->
      {#if q.type === "sort"}
        <div class="text-xs text-white/50 mb-3">请按从低到高的顺序，依次点选：</div>
        <div class="flex flex-col gap-2">
          {#each q.items as item, i}
            {@const pos = sortOrder.indexOf(i)}
            <button
              on:click={() => toggleSort(i)}
              class="flex items-center gap-3 px-4 py-3 rounded-xl border transition text-sm {pos >= 0
                ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                : 'border-white/20 bg-white/5 text-neutral-200 hover:border-amber-300/60 hover:bg-white/10'}"
            >
              <span class="inline-flex w-7 h-7 rounded-full text-xs items-center justify-center {pos >= 0
                ? 'bg-amber-400 text-slate-900 font-bold'
                : 'bg-white/10 text-white/40'}"
              >{pos >= 0 ? pos + 1 : "·"}</span>{item}
            </button>
          {/each}
        </div>
        <div class="text-xs text-white/40 mt-3">
          当前顺序：{sortOrder.length ? sortOrder.map((i) => (q as any).items[i]).join(" → ") : "（尚未选择）"}
        </div>
      {/if}

      <!-- 导航 -->
      <div class="flex justify-between mt-8">
        {#if current > 0}
          <button on:click={goPrev} class="btn-regular px-5 py-2 text-sm">上一重</button>
        {:else}
          <div></div>
        {/if}
        {#if !isLast}
          <button
            on:click={goNext}
            class="btn-regular px-5 py-2 text-sm bg-amber-500 border-amber-500 text-slate-900 hover:bg-amber-400"
          >下一重</button>
        {:else}
          <button
            on:click={submit}
            class="px-6 py-2 rounded-lg text-sm font-bold bg-amber-500 text-slate-900 hover:bg-amber-400 transition"
          >交卷 · 登仙台</button>
        {/if}
      </div>
    </div>
  </div>
{/if}