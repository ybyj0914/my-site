<script lang="ts">
  type Phase = "idle" | "waiting" | "ready" | "result" | "done";
  type Level = { title: string; desc: string; color: string };

  const ROUNDS = 5;

  let phase: Phase = "idle";
  let times: number[] = [];
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startAt = 0;

  function startRound() {
    phase = "waiting";
    const delay = 1000 + Math.random() * 2000;
    timer = setTimeout(() => {
      phase = "ready";
      startAt = performance.now();
    }, delay);
  }

  function handleClick() {
    if (phase === "idle" || phase === "result") {
      startRound();
      return;
    }

    if (phase === "waiting") {
      if (timer) clearTimeout(timer);
      alert("太早了！等变绿再点");
      phase = "idle";
      return;
    }

    if (phase === "ready") {
      const ms = Math.round(performance.now() - startAt);
      lastTime = ms;
      times = [...times, ms];

      if (times.length >= ROUNDS) {
        phase = "done";
      } else {
        phase = "result";
      }
    }
  }

  function restart() {
    if (timer) clearTimeout(timer);
    phase = "idle";
    times = [];
    lastTime = 0;
  }

  $: avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  $: best = times.length > 0 ? Math.min(...times) : 0;
  $: progress = Math.round((times.length / ROUNDS) * 100);

  // ★ 用派生变量生成背景类，避免重复的 class: 指令
  $: stageClass =
    phase === "idle" || phase === "result"
      ? "bg-neutral-100 dark:bg-neutral-900"
      : phase === "waiting"
      ? "bg-rose-500"
      : phase === "ready"
      ? "bg-emerald-500"
      : "";

  function getLevel(ms: number): Level {
    if (ms < 150) return { title: "⚡ 闪电反应", desc: "你的神经反射堪比职业电竞选手。", color: "text-yellow-500" };
    if (ms < 200) return { title: "🏆 顶级反应", desc: "反应极快，超过绝大多数人。", color: "text-rose-500" };
    if (ms < 250) return { title: "🌟 优秀", desc: "反应敏捷，状态良好。", color: "text-purple-500" };
    if (ms < 300) return { title: "👍 良好", desc: "正常水平，稍加练习会更快。", color: "text-blue-500" };
    if (ms < 400) return { title: "😐 一般", desc: "比平均稍慢，可以多练练。", color: "text-emerald-500" };
    return { title: "🐢 需要练习", desc: "慢慢来，多练几次会有提升。", color: "text-neutral-500" };
  }

  $: level = getLevel(avg);
</script>

<div
  class="reaction-stage rounded-2xl overflow-hidden select-none cursor-pointer transition-colors duration-100 {stageClass}"
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={(e) => (e.key === " " || e.key === "Enter") && handleClick()}
>
  {#if phase === "idle"}
    <div class="flex flex-col items-center justify-center py-20 px-6">
      <div class="text-5xl mb-4">⚡</div>
      <h2 class="text-2xl font-bold mb-2">反应速度测试</h2>
      <p class="text-sm text-neutral-500 mb-6 text-center leading-relaxed">
        点开始后，等屏幕变<span class="text-emerald-500 font-bold">绿</span>，尽快点击。<br/>
        共 {ROUNDS} 轮，取平均成绩。
      </p>
      <div class="px-6 py-3 rounded-lg bg-(--primary) text-white font-bold">
        点击开始
      </div>
    </div>

  {:else if phase === "waiting"}
    <div class="flex flex-col items-center justify-center py-20 px-6 text-white">
      <div class="text-xl font-bold mb-3">等待变绿…</div>
      <div class="text-sm opacity-80">别急着点</div>
    </div>

  {:else if phase === "ready"}
    <div class="flex flex-col items-center justify-center py-20 px-6 text-white">
      <div class="text-4xl font-bold">点！</div>
    </div>

  {:else if phase === "result"}
    <div class="flex flex-col items-center justify-center py-16 px-6">
      <div class="text-sm text-neutral-400 mb-2">本轮成绩</div>
      <div class="text-5xl font-bold text-(--primary) mb-2">{lastTime} <span class="text-lg">ms</span></div>
      <div class="text-sm text-neutral-500 mb-6">第 {times.length} / {ROUNDS} 轮</div>
      <div class="w-full max-w-xs h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-6">
        <div class="h-full bg-(--primary) transition-all duration-300" style="width: {progress}%"></div>
      </div>
      <div class="px-6 py-3 rounded-lg bg-(--primary) text-white font-bold">
        继续下一轮
      </div>
    </div>

  {:else if phase === "done"}
    <div class="flex flex-col items-center justify-center py-16 px-6">
      <div class="text-sm text-neutral-400 mb-3 tracking-widest">平均反应</div>
      <div class="text-6xl font-bold text-(--primary) mb-2">
        {avg}<span class="text-2xl"> ms</span>
      </div>

      <div class="text-xl font-bold {level.color} mb-2">{level.title}</div>
      <div class="text-sm text-neutral-500 text-center mb-6 max-w-xs leading-relaxed">{level.desc}</div>

      <div class="w-full max-w-sm mb-6">
        <div class="text-xs text-neutral-400 mb-3 text-center">各轮成绩</div>
        <div class="flex justify-center gap-2 flex-wrap">
          {#each times as t, i}
            <div class="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm">
              <span class="text-neutral-400 text-xs mr-1">#{i + 1}</span>
              <span class="font-bold">{t}</span>
              <span class="text-neutral-400 text-xs ml-0.5">ms</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="text-sm text-neutral-500 mb-6">
        最快：<span class="font-bold text-emerald-500">{best} ms</span>
      </div>

      <button
        on:click|stopPropagation={restart}
        class="btn-regular px-6 py-2 text-sm"
      >
        🔄 再测一次
      </button>
    </div>
  {/if}
</div>

<style>
  .reaction-stage {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
</style>