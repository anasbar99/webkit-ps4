function load_script(src, remote = true, transfer = []) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function doJb() {
  await load_script('src/misc.js');
  if (window.jailbreakStopRequested) return;

  try {
    version.init();
    switch (version.console) {
      case 4:
        await load_script('src/ps4/constants.js');
        await load_script('src/ps4/userland.js');
        if (window.jailbreakStopRequested) return;
        break;
      case 5:
        //TODO
        break;
      default:
        logger.info(`Unsupported console ${version.console}`);
    }

    logger.info('===USERLAND===');

    let rw = undefined;
    if (window.jailbreakStopRequested) return;
    if (arw.master === undefined) {
      rw = await init_rw();
    }
    if (window.jailbreakStopRequested) return;

    init_arw(rw);
    init_rop();
    init_syscalls();

    logger.info('===USERLAND READY===');

    await load_script('src/loader.js');
    await load_script('src/workers.js');
    if (window.jailbreakStopRequested) return;

    switch (version.console) {
      case 4:
        await load_script('src/ps4/kernel.js');
        break;
      case 5:
        //TODO
        break;
      default:
        logger.info(`Unsupported console ${version.console}`);
    }

    await load_script(`src/${exploitChain}.js`);
    if (window.jailbreakStopRequested) return;

    logger.info(`===${exploitChain.toUpperCase()}===`);

    try {
      if (exploitChain == 'lapse') {
        init();
        await setup();
        if (window.jailbreakStopRequested) return;
        await double_free_reqs2();
        leak_kaddrs();
        double_free_reqs1();
        make_karw();

        // Increase reference counts for the pipes
        inc_karw_pipe_refcnt();

        logger.info('Corrupted context cleanup started...');

        // Remove pktinfo pointers
        remove_pktinfo_from_so(pktopts_twins[0]);

        // Remove rthdr pointers
        remove_rthdr_from_so(pktopts_twins[1]);
        remove_rthdr_from_so(rthdr_twins[0]);

        logger.info('Corrupted context cleanup completed !!');
      } else {
        init();
        await setup();
        if (window.jailbreakStopRequested) return;
        await ucred_triple_free();
        leak_kqueue();
        await make_karw();

        inc_karw_pipe_refcnt();

        logger.info('Corrupted context cleanup started...');

        // Remove rthdr pointers from triplets
        for (let i = 0; i < triplets.length; i++) {
          remove_rthdr_from_so(triplets[i]);
        }

        // Remove triple freed file from free list
        remove_uaf_file();

        logger.info('Corrupted context cleanup completed !!');
      }
    } finally {
      cleanup();
    }

    find_all_proc();
    if (window.jailbreakStopRequested) return;

    // Avoid reapplying kernel changes if they are already active.
    if (fn.setuid.invoke(0) === -1) {
      jailbreak();

      const kpatches_rsp = await fetch(`src/ps4/patches/${constants.KPATCH}`);
      if (window.jailbreakStopRequested) return;
      const kpatches_buf = await kpatches_rsp.arrayBuffer();
      const kpatches_u8 = new Uint8Array(kpatches_buf);

      kernel_patches(kpatches_u8);
    }

    const bin_rsp = await fetch('src/payload.bin');
    if (window.jailbreakStopRequested) return;
    const bin_buf = await bin_rsp.arrayBuffer();
    const bin_u8 = new Uint8Array(bin_buf);

    load_bin(bin_u8);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (window.jailbreakStopRequested) return;

    logger.info('===END===');
    setConsoleStatus('done');
  } catch (e) {
    logger.error(e.message);
    logger.error(e.stack);
    //mem.free_all();
  }
}
