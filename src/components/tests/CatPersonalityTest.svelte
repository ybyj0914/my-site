<script lang="ts">
  // ===== 类型 =====
  type Option = { text: string; score: string };
  type Question = { q: string; options: Option[] };
  type Result = { title: string; desc: string };

  // ===== 题库（组件内部私有，不影响外部） =====
  const questions: Question[] = [
    {
      q: "周末你更想做什么？",
      options: [
        { text: "宅家睡觉", score: "cat" },
        { text: "出门社交", score: "dog" },
        { text: "看书学习", score: "owl" },
      ],
    },
    {
      q: "遇到陌生人你通常？",
      options: [
        { text: "远远观察", score: "cat" },
        { text: "主动打招呼", score: "dog" },
        { text: "礼貌但保持距离", score: "owl" },
      ],
    },
    {
      q: "朋友聚会你更常？",
      options: [
        { text: "角落安静待着", score: "cat" },
        { text: "活跃气氛", score: "dog" },
        { text: "和熟人深聊", score: "owl" },
      ],
    },
    {
      q: "做决定时你更靠？",
      options: [
        { text: "直觉", score: "cat" },
        { text: "感觉", score: "dog" },
        { text: "分析", score: "owl" },
      ],
    },
    {
      q: "你更喜欢哪种状态？",
      options: [
        { text: "独处", score: "cat" },
        { text: "热闹", score: "dog" },
        { text: "思考", score: "owl" },
      ],
    },
  ];

  const results: Record<string, Result> = {
    cat: { title: "🐱 猫系人格", desc: "独立、敏感、有自己的节奏。你享受独处，也懂得在需要时靠近。" },
    dog: { title: "🐶 狗系人格", desc: "热情、外向、喜欢和人待在一起。你总能给人带来温暖。" },
    owl: { title: "🦉 猫头鹰系人格", desc: "理性、冷静、喜欢思考。你在安静中找到自己的答案。" },
  };

  // ===== 状态（Svelte 的 let 是响应式的：改它，UI 自动更新） =====
  let current = 0;
  let scores: Record<string, number> = { cat: 0, dog: 0, owl: 0 };

  // ===== 答题 =====
  function choose(score: string) {
    // 用「重建对象」的方式改，Svelte 一定会检测到变化
    scores = { ...scores, [score]: scores[score] + 1 };
    current += 1;
  }

  // ===== 重测 =====
  function restart() {
    current = 0;
    scores = { cat: 0, dog: 0, owl: 0 };
  }

  // ===== 派生状态（$: 是 Svelte 的响应式声明：依赖变了，它自动重算） =====
  $: isDone = current >= questions.length;
  $: topKey = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  $: result = results[topKey];
  $: progress = Math.round((current / questions.length) * 100);
</script>

{#if !isDone}
  <!-- 答题界面 -->
  <div class="relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-900/70">
    <div class="flex justify-between text-xs text-neutral-400 mb-2">
      <span>第 {current + 1} / {questions.length} 题</span>
      <span>{progress}%</span>
    </div>

    <div class="w-full h-2 bg-neutral-200/70 rounded-full mb-6">
      <div
        class="h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>

    <h2 class="text-xl font-bold mb-6 text-neutral-800 dark:text-neutral-100">
      {questions[current].q}
    </h2>

    <div class="flex flex-col gap-3">
      {#each questions[current].options as opt}
        <button
          on:click={() => choose(opt.score)}
          class="card-base p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
        >
          {opt.text}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <!-- 结果界面 -->
  <div class="card-base p-8 text-center">
    <h2 class="text-2xl font-bold mb-4">{result.title}</h2>
    <p class="text-neutral-500 mb-6">{result.desc}</p>
    <button on:click={restart} class="btn-regular px-6 py-2">再测一次</button>
  </div>
{/if}