<script lang="ts">
  import { questions, dimensions, options } from "@/data/tests/happiness";

  const STORAGE_KEY = "happiness_answers";
  const TOTAL = questions.length;

  // ===== 状态 =====
  let currentDimension = 0;
  let answers: (number | null)[] = loadAnswers();
  let showResult = false;

  // ===== 持久化 =====
  function loadAnswers(): (number | null)[] {
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

  function pickAnswer(qid: number, value: number) {
    answers[qid - 1] = value;
    answers = [...answers];   // 触发 Svelte 响应式
    saveAnswers();
  }

  // ===== 导航 =====
  function goPrev() {
    if (currentDimension > 0) currentDimension -= 1;
  }

  function goNext() {
    if (!confirmIfUnanswered()) return;
    currentDimension += 1;
  }

  function submit() {
    if (!confirmIfUnanswered()) return;
    const skipped = answers.filter((a) => a === -1).length;
    if (skipped > 30) {
      alert(`你跳过了 ${skipped} 题，请至少答 ${TOTAL - 30} 题。`);
      return;
    }
    showResult = true;
  }

  function confirmIfUnanswered(): boolean {
    const dim = dimensions[currentDimension];
    const dimQs = questions.filter((q) => q.dimension === dim.key);
    const unanswered = dimQs.filter((q) => answers[q.id - 1] === null).length;
    if (unanswered > 0) {
      return confirm(`本部分还有 ${unanswered} 题未作答，确定继续？（未答计 0 分）`);
    }
    return true;
  }

  function restart() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    location.reload();
  }

  // ===== 派生状态（$: 自动追踪依赖） =====
  $: answeredCount = answers.filter((a) => a !== null).length;
  $: progress = Math.round((answeredCount / TOTAL) * 100);
  $: currentDim = dimensions[currentDimension];
  $: dimQs = currentDim ? questions.filter((q) => q.dimension === currentDim.key) : [];

  // ===== 结果计算 =====
  function calcResult() {
    let totalScore = 0;
    let totalMax = 0;
    const dimScores: Record<string, { score: number; max: number }> = {};
    const subAgg: Record<string, { score: number; max: number }> = {};
    dimensions.forEach((dim) => { dimScores[dim.key] = { score: 0, max: 0 }; });

    questions.forEach((q, i) => {
      const a = answers[i];
      if (a === null || a === -1) return;
      const score = q.reversed ? 8 - a : a;
      totalScore += score;
      totalMax += 7;
      dimScores[q.dimension].score += score;
      dimScores[q.dimension].max += 7;
      const key = `${q.dimension}::${q.subDimension}`;
      if (!subAgg[key]) subAgg[key] = { score: 0, max: 0 };
      subAgg[key].score += score;
      subAgg[key].max += 7;
    });

    const totalPercent = totalMax > 0 ? totalScore / totalMax : 0;

    const dims = dimensions.map((dim) => {
      const d = dimScores[dim.key];
      const percent = d.max === 0 ? totalPercent : d.score / d.max;
      return {
        key: dim.key,
        label: dim.label,
        score: Math.round(percent * 84),
        percent: Math.round(percent * 100),
        subs: dim.subDimensions.map((s) => {
          const k = `${dim.key}::${s}`;
          const agg = subAgg[k];
          const p = agg && agg.max > 0 ? Math.round((agg.score / agg.max) * 100) : 0;
          return { name: s, percent: p };
        }),
      };
    });

    return {
      totalScore: Math.round(totalPercent * 504),
      totalPercent: Math.round(totalPercent * 100),
      dims,
      skipped: answers.filter((a) => a === -1).length,
    };
  }

  $: result = showResult ? calcResult() : null;
  $: lowest = result ? result.dims.reduce((min, d) => (d.percent < min.percent ? d : min), result.dims[0]) : null;
  $: weakestSub = lowest && lowest.subs.length > 0
    ? lowest.subs.reduce((min, s) => (s.percent < min.percent ? s : min), lowest.subs[0])
    : null;

  // ===== 雷达图几何 =====
  const CX = 150, CY = 150, R = 100;
  $: n = result?.dims.length ?? 0;

  function polygonPoints(radius: number): string {
    if (n === 0) return "";
    const angleStep = (Math.PI * 2) / n;
    const pts: string[] = [];
    for (let i = 0; i < n; i += 1) {
      const angle = -Math.PI / 2 + i * angleStep;
      pts.push(`${CX + radius * Math.cos(angle)},${CY + radius * Math.sin(angle)}`);
    }
    return pts.join(" ");
  }

  function dataPolygonPoints(): string {
    if (!result || n === 0) return "";
    const angleStep = (Math.PI * 2) / n;
    const pts: string[] = [];
    result.dims.forEach((d, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const rr = (R * d.percent) / 100;
      pts.push(`${CX + rr * Math.cos(angle)},${CY + rr * Math.sin(angle)}`);
    });
    return pts.join(" ");
  }

  function dataCirclePos(i: number): [number, number] {
    const angleStep = (Math.PI * 2) / n;
    const angle = -Math.PI / 2 + i * angleStep;
    const rr = (R * (result?.dims[i].percent ?? 0)) / 100;
    return [CX + rr * Math.cos(angle), CY + rr * Math.sin(angle)];
  }

  function labelPos(i: number): [number, number] {
    const angleStep = (Math.PI * 2) / n;
    const angle = -Math.PI / 2 + i * angleStep;
    return [CX + (R + 28) * Math.cos(angle), CY + (R + 28) * Math.sin(angle)];
  }

  function axisEnd(i: number): [number, number] {
    const angleStep = (Math.PI * 2) / n;
    const angle = -Math.PI / 2 + i * angleStep;
    return [CX + R * Math.cos(angle), CY + R * Math.sin(angle)];
  }

  // ===== 解读 =====
  function getDimComment(label: string, percent: number): string {
    if (percent >= 80) return `${label}表现优秀，这是你的优势领域。`;
    if (percent >= 60) return `${label}表现良好，保持现有节奏即可。`;
    if (percent >= 40) return `${label}表现一般，还有一定提升空间。`;
    return `${label}需要重点关注，建议优先改善。`;
  }

  function getOverallConclusion(percent: number): string {
    if (percent >= 80) return "你的整体幸福指数很高，生活状态良好，继续保持。";
    if (percent >= 60) return "你的整体幸福指数良好，部分维度还有提升空间，可针对短板小幅优化。";
    if (percent >= 40) return "你的整体幸福指数一般，建议关注短板维度，逐步改善。";
    return "你的整体幸福指数偏低，建议从最短板入手，优先改善最紧迫的部分。";
  }

  // ===== 复制 =====
  async function copyResult() {
    if (!result) return;
    const text = [
      "我的幸福指数",
      `总分：${result.totalScore} / 504（${result.totalPercent}%）`,
      "",
      "各维度：",
      ...result.dims.map((d) => `- ${d.label}：${d.score} / 84（${d.percent}%）`),
      "",
      getOverallConclusion(result.totalPercent),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      alert("复制失败，请手动选择文字复制");
    }
  }

  // ===== 下载雷达图 =====
  let radarSvg: SVGSVGElement | null = null;

  function downloadRadar() {
    if (!radarSvg) { alert("找不到雷达图"); return; }
    const data = new XMLSerializer().serializeToString(radarSvg);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "happiness-radar.svg";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

{#if showResult && result}
  <!-- ============ 结果视图 ============ -->
  <div class="card-base p-6 md:p-8">
    <h2 class="text-2xl font-bold mb-4 text-center">你的幸福指数</h2>
    <div class="text-center text-5xl font-bold mb-2 text-rose-500">
      {result.totalScore} <span class="text-lg text-neutral-400">/ 504</span>
    </div>
    <div class="text-center text-neutral-500 mb-8">{result.totalPercent}%</div>

    <!-- 雷达图 -->
    <div class="mb-8">
      <svg bind:this={radarSvg} viewBox="0 0 300 300" class="w-full max-w-xs mx-auto">
        {#each [1, 2, 3, 4, 5] as level}
          <polygon
            points={polygonPoints((R * level) / 5)}
            fill="none"
            stroke="#e5e5e5"
            stroke-width="1"
          />
        {/each}
        {#each result.dims as _, i}
          {@const end = axisEnd(i)}
          <line x1={CX} y1={CY} x2={end[0]} y2={end[1]} stroke="#e5e5e5" stroke-width="1" />
        {/each}
        <polygon
          points={dataPolygonPoints()}
          fill="rgba(244,114,182,0.22)"
          stroke="#f43f5e"
          stroke-width="2"
        />
        {#each result.dims as _, i}
          {@const p = dataCirclePos(i)}
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#f43f5e" />
        {/each}
        {#each result.dims as d, i}
          {@const pos = labelPos(i)}
          <text
            x={pos[0]} y={pos[1]}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="12"
            fill="#666"
          >{d.label}</text>
        {/each}
      </svg>
    </div>

    <!-- 维度条 -->
    <div class="flex flex-col gap-4 mb-8">
      {#each result.dims as d}
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>{d.label}</span>
            <span>{d.score} / 84</span>
          </div>
          <div class="w-full bg-neutral-200 rounded-full h-2">
            <div class="bg-rose-400 h-2 rounded-full" style="width: {d.percent}%"></div>
          </div>
          <div class="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-neutral-400">
            {#each d.subs as s}
              <span>{s.name} {s.percent}%</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- 综合结论 -->
    <div class="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30">
      <h3 class="font-bold mb-2">📝 综合结论</h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {getOverallConclusion(result.totalPercent)}
      </p>
      {#if lowest && weakestSub}
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          短板维度：<strong>{lowest.label}</strong>（{lowest.percent}%），其中<strong>{weakestSub.name}</strong>（{weakestSub.percent}%）最弱，建议优先关注。
        </p>
      {/if}
    </div>

    <!-- 各维度解读 -->
    <div class="mb-6">
      <h3 class="font-bold mb-3">📊 各维度解读</h3>
      <div class="flex flex-col gap-2">
        {#each result.dims as d}
          <div class="text-sm">
            <strong>{d.label}</strong>（{d.percent}%）：{getDimComment(d.label, d.percent)}
          </div>
        {/each}
      </div>
    </div>

    <!-- 跳过提示 -->
    {#if result.skipped > 0}
      <p class="text-sm text-neutral-400 text-center mb-4">
        {#if result.skipped > 20}
          你跳过了 {result.skipped} 题，结果可信度较低，建议尽量作答。
        {:else if result.skipped > 10}
          你跳过了 {result.skipped} 题，部分维度可能不够准确。
        {:else}
          你跳过了 {result.skipped} 题。
        {/if}
      </p>
    {/if}

    <!-- 按钮 -->
    <div class="flex flex-wrap gap-3 justify-center">
      <button on:click={copyResult} class="btn-regular px-5 py-2 text-sm">📋 复制结果</button>
      <button on:click={downloadRadar} class="btn-regular px-5 py-2 text-sm">📥 下载雷达图</button>
      <button on:click={restart} class="btn-regular px-5 py-2 text-sm">🔄 再测一次</button>
    </div>
  </div>
{:else if currentDim}
  <!-- ============ 答题视图 ============ -->
  <div class="relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-b from-rose-50/70 via-amber-50/40 to-white p-6 md:p-8 dark:from-rose-950/20 dark:via-amber-950/10 dark:to-transparent dark:border-neutral-800">
    <div class="pointer-events-none absolute inset-0" style="background: radial-gradient(50% 35% at 85% 0%, rgba(244,114,182,0.12), transparent);"></div>
    <div class="relative">
      <div class="flex justify-between text-xs text-neutral-400 mb-2">
        <span>第 {currentDimension + 1} / {dimensions.length} 部分</span>
        <span>已答 {answeredCount} / {TOTAL} 题</span>
      </div>
      <div class="w-full h-2 bg-neutral-200/70 rounded-full mb-1">
        <div
          class="h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-300"
          style="width: {progress}%"
        ></div>
      </div>
      <div class="text-[10px] text-neutral-400 mb-6 text-right">整体进度 {progress}%</div>

      <h2 class="text-xl font-bold mb-1">{currentDim.label}</h2>
      <div class="flex flex-wrap gap-1.5 mb-6">
        {#each currentDim.subDimensions as s}
          <span class="px-2 py-0.5 rounded-full bg-rose-100/70 text-rose-600 text-[11px] dark:bg-rose-900/30 dark:text-rose-300">{s}</span>
        {/each}
      </div>

      <div class="flex flex-col gap-3">
        {#each dimQs as q}
          <div class="rounded-xl border border-neutral-200 bg-white/80 p-5 transition hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div class="mb-4 font-medium text-neutral-800 dark:text-neutral-100">{q.id}. {q.text}</div>
            <div class="flex flex-wrap gap-2">
              {#each options as opt}
                <button
                  on:click={() => pickAnswer(q.id, opt.value)}
                  class="px-3 py-1.5 rounded-lg border text-xs transition {answers[q.id - 1] === opt.value
                    ? 'bg-(--primary) text-white border-(--primary) shadow-sm'
                    : 'border-neutral-300 text-neutral-700 hover:border-(--primary) hover:text-(--primary) dark:border-neutral-600 dark:text-neutral-300'}"
                >{opt.label}</button>
              {/each}
              <button
                on:click={() => pickAnswer(q.id, -1)}
                class="px-3 py-1.5 rounded-lg border text-xs transition {answers[q.id - 1] === -1
                  ? 'bg-neutral-500 text-white border-neutral-500'
                  : 'border-neutral-300 text-neutral-500 hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-400'}"
              >不适用</button>
            </div>
          </div>
        {/each}
      </div>

      <div class="flex justify-between mt-8">
        {#if currentDimension > 0}
          <button on:click={goPrev} class="btn-regular px-6 py-2">上一部分</button>
        {:else}
          <div></div>
        {/if}
        {#if currentDimension < dimensions.length - 1}
          <button on:click={goNext} class="btn-regular px-6 py-2">下一部分</button>
        {:else}
          <button on:click={submit} class="btn-regular px-6 py-2">查看结果</button>
        {/if}
      </div>
    </div>
  </div>
{/if}