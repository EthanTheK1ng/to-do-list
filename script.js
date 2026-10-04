// =========================
// CONFIG
// =========================

const SUPABASE_URL =
    "https://rtsxlicdwxenamvkskyi.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ujPV0QXsAm_lhpryqQL5Bg_Pam6oVaO";

const TABLE_NAME =
    "todo_items";

const USER_NAME =
    "Ethan";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// STATE
// =========================

let entries = [];

let editingEntryId = null;

let sortableInstances = [];

let realtimeChannel = null;
let realtimeTimer = null;

let toastTimer = null;
let deleteTimer = null;

let suppressRealtime = false;


// =========================
// ELEMENTS
// =========================

const loadingScreen =
    document.getElementById("app-loading-screen");

const greetingText =
    document.getElementById("greeting-text");

const currentDateElement =
    document.getElementById("current-date");

const totalSummary =
    document.getElementById("total-summary");

const shortCount =
    document.getElementById("short-count");

const longCount =
    document.getElementById("long-count");

const shortList =
    document.getElementById("short-list");

const longList =
    document.getElementById("long-list");

const shortEmpty =
    document.getElementById("short-empty");

const longEmpty =
    document.getElementById("long-empty");

const shortTermKicker =
    document.getElementById("short-term-kicker");

const longTermKicker =
    document.getElementById("long-term-kicker");

const newEntryButton =
    document.getElementById("new-entry-button");

const entryDialog =
    document.getElementById("entry-dialog");

const entryForm =
    document.getElementById("entry-form");

const entryDialogKicker =
    document.getElementById("entry-dialog-kicker");

const entryDialogTitle =
    document.getElementById("entry-dialog-title");

const closeEntryButton =
    document.getElementById("close-entry-button");

const entryName =
    document.getElementById("entry-name");

const entryColor =
    document.getElementById("entry-color");

const colorOptions =
    document.getElementById("color-options");

const entryTerm =
    document.getElementById("entry-term");

const termOptions =
    document.getElementById("term-options");

const deleteEntryButton =
    document.getElementById("delete-entry-button");

const saveEntryButton =
    document.getElementById("save-entry-button");

const saveEntryText =
    document.getElementById("save-entry-text");

const infoDialog =
    document.getElementById("info-dialog");

const closeInfoButton =
    document.getElementById("close-info-button");

const infoName =
    document.getElementById("info-name");

const infoCreated =
    document.getElementById("info-created");

const infoUpdated =
    document.getElementById("info-updated");

const infoTerm =
    document.getElementById("info-term");

const infoColor =
    document.getElementById("info-color");

const infoColorDot =
    document.getElementById("info-color-dot");

const toast =
    document.getElementById("toast");


// =========================
// STARTUP
// =========================

function hideLoadingScreen() {
    loadingScreen.classList.add("hidden");
}


function randomItem(array) {
    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];
}


function showGreeting() {
    const now =
        new Date();

    const hour =
        now.getHours();

    const day =
        now.getDay();


    const general = [
        `What’s the move, ${USER_NAME}?`,
        `One thing at a time, ${USER_NAME}.`,
        `What are we getting done, ${USER_NAME}?`,
        "Let’s make some room in your brain.",
        "A clean list feels good.",
        "Let’s knock a few things out."
    ];


    const dayMessages = {
        0: [
            `Sunday reset, ${USER_NAME}.`,
            "Set up the week before it starts.",
            "Make Monday easier on yourself."
        ],

        1: [
            `New week, ${USER_NAME}.`,
            "Monday. Let’s make it manageable.",
            "Start the week clean."
        ],

        2: [
            `Tuesday momentum, ${USER_NAME}.`,
            "Keep the week moving.",
            "A solid Tuesday goes a long way."
        ],

        3: [
            `Halfway there, ${USER_NAME}.`,
            "Wednesday check-in.",
            "Midweek cleanup time."
        ],

        4: [
            `Almost Friday, ${USER_NAME}.`,
            "Thursday: finish what matters.",
            "Clear the runway for Friday."
        ],

        5: [
            `Friday, ${USER_NAME}. Finish strong.`,
            "Clean up the list before the weekend.",
            "Friday energy. Use it wisely."
        ],

        6: [
            `Weekend mode, ${USER_NAME}.`,
            "A little progress still counts.",
            "Saturday: low stress, steady progress."
        ]
    };


    let timeMessages;


    if (hour < 7) {
        timeMessages = [
            `Early start, ${USER_NAME}.`,
            "Quiet morning. Good time to get ahead.",
            "Starting early today."
        ];

    } else if (hour < 12) {
        timeMessages = [
            `Good morning, ${USER_NAME}.`,
            `Morning, ${USER_NAME}. What comes first?`,
            "Fresh day, fresh list."
        ];

    } else if (hour < 17) {
        timeMessages = [
            `Good afternoon, ${USER_NAME}.`,
            "Afternoon check-in.",
            "What’s worth finishing today?"
        ];

    } else if (hour < 21) {
        timeMessages = [
            `Good evening, ${USER_NAME}.`,
            "Let’s close out a few things.",
            "A little progress now = less stress later."
        ];

    } else {
        timeMessages = [
            `Keep it light tonight, ${USER_NAME}.`,
            `Late check-in, ${USER_NAME}.`,
            "Only do what actually matters tonight."
        ];
    }


    const roll =
        Math.random();


    if (roll < 0.5) {
        greetingText.textContent =
            randomItem(
                dayMessages[day]
            );

    } else if (roll < 0.82) {
        greetingText.textContent =
            randomItem(
                timeMessages
            );

    } else {
        greetingText.textContent =
            randomItem(
                general
            );
    }
}


function showCurrentDate() {
    currentDateElement.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );
}


function randomizeSectionLabels() {
    const shortLabels = [
        "Right now",
        "Up next",
        "Current mission",
        "For today",
        "In progress",
        "On deck"
    ];

    const longLabels = [
        "For the future",
        "Looking ahead",
        "Later on",
        "Down the road",
        "Future plans",
        "Long term"
    ];


    shortTermKicker.textContent =
        randomItem(shortLabels);

    longTermKicker.textContent =
        randomItem(longLabels);
}


// =========================
// HELPERS
// =========================

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


function getCreatedLabel(value) {
    if (!value) {
        return "Created";
    }

    const date =
        new Date(value);

    const today =
        new Date();

    const sameDay =
        date.getFullYear() === today.getFullYear()
        &&
        date.getMonth() === today.getMonth()
        &&
        date.getDate() === today.getDate();


    if (sameDay) {
        return "Created today";
    }


    return `Created ${
        date.toLocaleDateString(
            "en-US",
            {
                month: "short",
                day: "numeric"
            }
        )
    }`;
}


function getTermLabel(term) {
    return term === "long"
        ? "Long Term"
        : "Short Term";
}


function showToast(
    message,
    undoCallback = null
) {
    clearTimeout(
        toastTimer
    );

    toast.innerHTML =
        "";


    const text =
        document.createElement("span");

    text.textContent =
        message;

    toast.appendChild(text);


    if (undoCallback) {
        const undoButton =
            document.createElement("button");

        undoButton.type =
            "button";

        undoButton.className =
            "toast-undo";

        undoButton.textContent =
            "Undo";


        undoButton.addEventListener(
            "click",
            async () => {
                clearTimeout(
                    toastTimer
                );

                undoButton.disabled =
                    true;

                await undoCallback();
            }
        );


        toast.appendChild(
            undoButton
        );
    }


    toast.classList.add(
        "show"
    );


    toastTimer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            undoCallback
                ? 5000
                : 2300
        );
}


function isInteractiveTarget(target) {
    return Boolean(
        target.closest(
            "button, input, textarea, select, a"
        )
    );
}


// =========================
// DATABASE
// =========================

function getNextSortOrder(term) {
    const matching =
        entries.filter(
            entry =>
                entry.term === term
                &&
                !entry.completed
        );


    if (!matching.length) {
        return 0;
    }


    return (
        Math.max(
            ...matching.map(
                entry =>
                    Number(entry.sortOrder) || 0
            )
        )
        +
        1
    );
}


async function loadEntries() {
    const {
        data,
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .select(
                "id,name,color,term,sort_order,created_at,updated_at,completed"
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            )
            .order(
                "id",
                {
                    ascending: true
                }
            );


    if (error) {
        console.error(
            "Could not load items:",
            error
        );

        showToast(
            "Couldn’t load your list."
        );

        return false;
    }


    entries =
        (data || []).map(
            entry => ({
                id:
                    Number(entry.id),

                name:
                    entry.name,

                color:
                    entry.color || "#7c5cff",

                term:
                    entry.term === "long"
                        ? "long"
                        : "short",

                sortOrder:
                    Number(entry.sort_order) || 0,

                createdAt:
                    entry.created_at,

                updatedAt:
                    entry.updated_at,

                completed:
                    Boolean(entry.completed)
            })
        );


    renderAll();

    return true;
}


async function addEntryToDatabase(
    item
) {
    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .insert({
                name:
                    item.name,

                color:
                    item.color,

                term:
                    item.term,

                sort_order:
                    getNextSortOrder(
                        item.term
                    ),

                completed:
                    false
            });


    if (error) {
        console.error(
            "Could not add item:",
            error
        );

        showToast(
            "Couldn’t add that item."
        );

        return false;
    }


    await loadEntries();

    return true;
}


async function updateEntryInDatabase(
    existing,
    changes
) {
    const moved =
        existing.term !== changes.term;


    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .update({
                name:
                    changes.name,

                color:
                    changes.color,

                term:
                    changes.term,

                sort_order:
                    moved
                        ? getNextSortOrder(
                            changes.term
                        )
                        : existing.sortOrder
            })
            .eq(
                "id",
                existing.id
            );


    if (error) {
        console.error(
            "Could not update item:",
            error
        );

        showToast(
            "Couldn’t save your changes."
        );

        return false;
    }


    await loadEntries();

    return true;
}


async function deleteEntryFromDatabase(
    entry
) {
    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .delete()
            .eq(
                "id",
                entry.id
            );


    if (error) {
        console.error(
            "Could not delete item:",
            error
        );

        showToast(
            "Couldn’t delete that item."
        );

        return false;
    }


    await loadEntries();

    return true;
}


async function setEntryCompleted(
    entryId,
    completed
) {
    const {
        error
    } =
        await supabaseClient
            .from(TABLE_NAME)
            .update({
                completed
            })
            .eq(
                "id",
                entryId
            );


    if (error) {
        console.error(
            "Could not change completion:",
            error
        );

        showToast(
            "Couldn’t update that item."
        );

        return false;
    }


    await loadEntries();

    return true;
}


// =========================
// REALTIME
// =========================

function subscribeToChanges() {
    if (realtimeChannel) {
        supabaseClient.removeChannel(
            realtimeChannel
        );
    }


    realtimeChannel =
        supabaseClient
            .channel(
                "todo-items-realtime"
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: TABLE_NAME
                },
                () => {
                    if (suppressRealtime) {
                        return;
                    }

                    clearTimeout(
                        realtimeTimer
                    );

                    realtimeTimer =
                        setTimeout(
                            loadEntries,
                            180
                        );
                }
            )
            .subscribe();
}


// =========================
// SUMMARY
// =========================

function updateSummary() {
    const active =
        entries.filter(
            entry =>
                !entry.completed
        );


    const shortEntries =
        active.filter(
            entry =>
                entry.term === "short"
        );


    const longEntries =
        active.filter(
            entry =>
                entry.term === "long"
        );


    shortCount.textContent =
        shortEntries.length;

    longCount.textContent =
        longEntries.length;


    const total =
        active.length;


    totalSummary.textContent =
        total === 1
            ? "1 thing on your list"
            : `${total} things on your list`;
}


// =========================
// TASK CARDS
// =========================

function createGripIcon() {
    const wrap =
        document.createElement(
            "span"
        );

    wrap.className =
        "grip-dots";


    for (
        let i = 0;
        i < 6;
        i++
    ) {
        wrap.appendChild(
            document.createElement("i")
        );
    }


    return wrap;
}


function createEntryCard(entry) {
    const article =
        document.createElement(
            "article"
        );

    article.className =
        "task-card";

    article.dataset.entryId =
        String(entry.id);

    article.style.setProperty(
        "--entry-color",
        entry.color
    );


    // Swipe background

    const swipeAction =
        document.createElement(
            "div"
        );

    swipeAction.className =
        "swipe-action";

    swipeAction.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>

        <span>Edit</span>
    `;


    // Content

    const content =
        document.createElement(
            "div"
        );

    content.className =
        "task-content";


    // Drag button

    const dragHandle =
        document.createElement(
            "button"
        );

    dragHandle.type =
        "button";

    dragHandle.className =
        "drag-handle";

    dragHandle.setAttribute(
        "aria-label",
        `Reorder ${entry.name}`
    );

    dragHandle.appendChild(
        createGripIcon()
    );


    // Complete button

    const completeButton =
        document.createElement(
            "button"
        );

    completeButton.type =
        "button";

    completeButton.className =
        "complete-button";

    completeButton.setAttribute(
        "aria-label",
        `Complete ${entry.name}`
    );

    completeButton.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M5 12.5 9.2 17 19 7"></path>
        </svg>
    `;


    // Text

    const main =
        document.createElement(
            "div"
        );

    main.className =
        "task-main";


    const taskName =
        document.createElement(
            "h3"
        );

    taskName.className =
        "task-name";

    taskName.textContent =
        entry.name;


    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "task-meta";


    const dot =
        document.createElement(
            "span"
        );

    dot.className =
        "color-mini-dot";


    const created =
        document.createElement(
            "span"
        );

    created.textContent =
        getCreatedLabel(
            entry.createdAt
        );


    meta.append(
        dot,
        created
    );


    main.append(
        taskName,
        meta
    );


    // Info button

    const infoButton =
        document.createElement(
            "button"
        );

    infoButton.type =
        "button";

    infoButton.className =
        "info-button";

    infoButton.textContent =
        "i";

    infoButton.setAttribute(
        "aria-label",
        `Info for ${entry.name}`
    );


    infoButton.addEventListener(
        "click",
        () => {
            openInfoDialog(
                entry
            );
        }
    );


    // Complete event

    completeButton.addEventListener(
        "click",
        async () => {
            if (
                completeButton.disabled
            ) {
                return;
            }


            completeButton.disabled =
                true;

            article.classList.add(
                "completing"
            );


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        280
                    )
            );


            const success =
                await setEntryCompleted(
                    entry.id,
                    true
                );


            if (!success) {
                article.classList.remove(
                    "completing"
                );

                completeButton.disabled =
                    false;

                return;
            }


            showToast(
                "Completed",
                async () => {
                    const restored =
                        await setEntryCompleted(
                            entry.id,
                            false
                        );


                    if (restored) {
                        showToast(
                            "Restored to your list."
                        );
                    }
                }
            );
        }
    );


    content.append(
        dragHandle,
        completeButton,
        main,
        infoButton
    );


    article.append(
        swipeAction,
        content
    );


    addSwipeToEdit(
        article,
        content,
        swipeAction,
        entry
    );


    return article;
}


// =========================
// RENDER
// =========================

function renderList(
    list,
    term
) {
    list.innerHTML =
        "";


    entries
        .filter(
            entry =>
                entry.term === term
                &&
                !entry.completed
        )
        .sort(
            (a, b) =>
                (
                    a.sortOrder
                    -
                    b.sortOrder
                )
                ||
                (
                    a.id
                    -
                    b.id
                )
        )
        .forEach(
            entry => {
                list.appendChild(
                    createEntryCard(
                        entry
                    )
                );
            }
        );
}


function renderAll() {
    destroySortables();

    updateSummary();

    renderList(
        shortList,
        "short"
    );

    renderList(
        longList,
        "long"
    );


    shortEmpty.hidden =
        shortList.children.length > 0;

    longEmpty.hidden =
        longList.children.length > 0;


    initializeSortables();
}


// =========================
// DRAG AND DROP
// =========================

function destroySortables() {
    sortableInstances.forEach(
        sortable =>
            sortable.destroy()
    );

    sortableInstances =
        [];
}


function initializeSortables() {
    [
        shortList,
        longList
    ].forEach(
        list => {
            const sortable =
                Sortable.create(
                    list,
                    {
                        group:
                            "todo-items",

                        animation:
                            180,

                        handle:
                            ".drag-handle",

                        draggable:
                            ".task-card",

                        ghostClass:
                            "sortable-ghost",

                        chosenClass:
                            "sortable-chosen",

                        dragClass:
                            "sortable-drag",

                        onStart() {
                            shortList.classList.add(
                                "sortable-active"
                            );

                            longList.classList.add(
                                "sortable-active"
                            );
                        },

                        async onEnd(event) {
                            shortList.classList.remove(
                                "sortable-active"
                            );

                            longList.classList.remove(
                                "sortable-active"
                            );

                            await saveDragResult(
                                event
                            );
                        }
                    }
                );


            sortableInstances.push(
                sortable
            );
        }
    );
}


function getListUpdates(list) {
    const term =
        list.dataset.term;


    return [
        ...list.querySelectorAll(
            ".task-card"
        )
    ].map(
        (card, index) => ({
            id:
                Number(
                    card.dataset.entryId
                ),

            term,

            sortOrder:
                index
        })
    );
}


async function saveDragResult(event) {
    let updates = [
        ...getListUpdates(
            event.from
        )
    ];


    if (
        event.to !== event.from
    ) {
        updates.push(
            ...getListUpdates(
                event.to
            )
        );
    }


    updates =
        [
            ...new Map(
                updates.map(
                    update => [
                        update.id,
                        update
                    ]
                )
            ).values()
        ];


    suppressRealtime =
        true;


    try {
        const results =
            await Promise.all(
                updates.map(
                    update =>
                        supabaseClient
                            .from(TABLE_NAME)
                            .update({
                                term:
                                    update.term,

                                sort_order:
                                    update.sortOrder
                            })
                            .eq(
                                "id",
                                update.id
                            )
                )
            );


        const failed =
            results.find(
                result =>
                    result.error
            );


        if (failed) {
            throw failed.error;
        }


    } catch (error) {
        console.error(
            "Could not save order:",
            error
        );

        showToast(
            "Couldn’t save the new order."
        );

    } finally {
        suppressRealtime =
            false;

        await loadEntries();
    }
}


// =========================
// SWIPE LEFT TO EDIT
// =========================

function addSwipeToEdit(
    article,
    content,
    swipeAction,
    entry
) {
    let tracking =
        false;

    let startX =
        0;

    let startY =
        0;

    let currentX =
        0;

    let horizontal =
        false;


    function resetSwipe() {
        content.style.transform =
            "";

        swipeAction.style.opacity =
            "";

        swipeAction.style.transform =
            "";
    }


    article.addEventListener(
        "pointerdown",
        event => {
            if (
                isInteractiveTarget(
                    event.target
                )
            ) {
                return;
            }


            tracking =
                true;

            horizontal =
                false;

            startX =
                event.clientX;

            currentX =
                event.clientX;

            startY =
                event.clientY;

            article.classList.add(
                "swiping"
            );


            if (
                article.setPointerCapture
            ) {
                article.setPointerCapture(
                    event.pointerId
                );
            }
        }
    );


    article.addEventListener(
        "pointermove",
        event => {
            if (!tracking) {
                return;
            }


            currentX =
                event.clientX;


            const dx =
                currentX
                -
                startX;

            const dy =
                event.clientY
                -
                startY;


            if (
                !horizontal
                &&
                Math.abs(dy)
                >
                Math.abs(dx)
            ) {
                return;
            }


            if (
                Math.abs(dx) > 6
            ) {
                horizontal =
                    true;
            }


            if (!horizontal) {
                return;
            }


            const distance =
                Math.max(
                    0,
                    Math.min(
                        -dx,
                        110
                    )
                );


            content.style.transform =
                `translateX(-${distance}px)`;


            const progress =
                Math.min(
                    distance / 70,
                    1
                );


            swipeAction.style.opacity =
                progress;

            swipeAction.style.transform =
                `translateX(${
                    10 - progress * 10
                }px)`;
        }
    );


    function finishSwipe(event) {
        if (!tracking) {
            return;
        }


        tracking =
            false;

        article.classList.remove(
            "swiping"
        );


        const dx =
            currentX
            -
            startX;


        resetSwipe();


        if (
            horizontal
            &&
            dx <= -64
        ) {
            openEditDialog(
                entry
            );
        }


        if (
            article.releasePointerCapture
        ) {
            try {
                article.releasePointerCapture(
                    event.pointerId
                );
            } catch {
                // Ignore.
            }
        }
    }


    article.addEventListener(
        "pointerup",
        finishSwipe
    );


    article.addEventListener(
        "pointercancel",
        event => {
            tracking =
                false;

            horizontal =
                false;

            article.classList.remove(
                "swiping"
            );

            resetSwipe();


            if (
                article.releasePointerCapture
            ) {
                try {
                    article.releasePointerCapture(
                        event.pointerId
                    );
                } catch {
                    // Ignore.
                }
            }
        }
    );
}


// =========================
// FORM HELPERS
// =========================

function selectColor(color) {
    entryColor.value =
        color;


    colorOptions
        .querySelectorAll(
            ".color-swatch"
        )
        .forEach(
            button => {
                button.classList.toggle(
                    "selected",
                    button.dataset.color === color
                );
            }
        );
}


function selectTerm(term) {
    const selected =
        term === "long"
            ? "long"
            : "short";


    entryTerm.value =
        selected;


    termOptions
        .querySelectorAll(
            ".term-choice"
        )
        .forEach(
            button => {
                button.classList.toggle(
                    "selected",
                    button.dataset.term === selected
                );
            }
        );
}


function resetDeleteButton() {
    clearTimeout(
        deleteTimer
    );

    deleteEntryButton.classList.remove(
        "armed"
    );

    deleteEntryButton.textContent =
        "Delete";
}


function resetEntryForm() {
    editingEntryId =
        null;

    entryForm.reset();

    entryDialogKicker.textContent =
        "NEW ITEM";

    entryDialogTitle.textContent =
        "Add to your list";

    saveEntryText.textContent =
        "Add Item";

    deleteEntryButton.hidden =
        true;

    resetDeleteButton();

    selectColor(
        "#7c5cff"
    );

    selectTerm(
        "short"
    );
}


function openNewEntryDialog() {
    resetEntryForm();

    entryDialog.showModal();

    setTimeout(
        () =>
            entryName.focus(),
        50
    );
}


function openEditDialog(entry) {
    editingEntryId =
        entry.id;

    entryDialogKicker.textContent =
        "EDIT ITEM";

    entryDialogTitle.textContent =
        "Update this item";

    saveEntryText.textContent =
        "Save Changes";

    entryName.value =
        entry.name;

    selectColor(
        entry.color
    );

    selectTerm(
        entry.term
    );

    deleteEntryButton.hidden =
        false;

    resetDeleteButton();

    entryDialog.showModal();


    setTimeout(
        () => {
            entryName.focus();
            entryName.select();
        },
        50
    );
}


function setFormLoading(loading) {
    saveEntryButton.disabled =
        loading;

    deleteEntryButton.disabled =
        loading;

    closeEntryButton.disabled =
        loading;

    saveEntryButton.classList.toggle(
        "loading",
        loading
    );


    if (loading) {
        saveEntryText.textContent =
            editingEntryId
                ? "Saving…"
                : "Adding…";

    } else {
        saveEntryText.textContent =
            editingEntryId
                ? "Save Changes"
                : "Add Item";
    }
}


// =========================
// FORM EVENTS
// =========================

newEntryButton.addEventListener(
    "click",
    openNewEntryDialog
);


closeEntryButton.addEventListener(
    "click",
    () => {
        if (
            !saveEntryButton.disabled
        ) {
            entryDialog.close();
        }
    }
);


colorOptions.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                ".color-swatch"
            );


        if (!button) {
            return;
        }


        selectColor(
            button.dataset.color
        );
    }
);


termOptions.addEventListener(
    "click",
    event => {
        const button =
            event.target.closest(
                ".term-choice"
            );


        if (!button) {
            return;
        }


        selectTerm(
            button.dataset.term
        );
    }
);


entryDialog.addEventListener(
    "click",
    event => {
        if (
            event.target === entryDialog
            &&
            !saveEntryButton.disabled
        ) {
            entryDialog.close();
        }
    }
);


entryForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();


        const name =
            entryName.value.trim();


        if (!name) {
            return;
        }


        const item = {
            name,

            color:
                entryColor.value,

            term:
                entryTerm.value
        };


        setFormLoading(
            true
        );


        let success =
            false;


        if (editingEntryId !== null) {
            const existing =
                entries.find(
                    entry =>
                        entry.id
                        ===
                        Number(
                            editingEntryId
                        )
                );


            if (existing) {
                success =
                    await updateEntryInDatabase(
                        existing,
                        item
                    );
            }

        } else {
            success =
                await addEntryToDatabase(
                    item
                );
        }


        setFormLoading(
            false
        );


        if (success) {
            const wasEditing =
                editingEntryId !== null;


            entryDialog.close();

            resetEntryForm();


            showToast(
                wasEditing
                    ? "Changes saved."
                    : "Added to your list."
            );
        }
    }
);


deleteEntryButton.addEventListener(
    "click",
    async () => {
        if (
            editingEntryId === null
        ) {
            return;
        }


        if (
            !deleteEntryButton.classList.contains(
                "armed"
            )
        ) {
            deleteEntryButton.classList.add(
                "armed"
            );

            deleteEntryButton.textContent =
                "Tap again to delete";


            deleteTimer =
                setTimeout(
                    resetDeleteButton,
                    2500
                );

            return;
        }


        const entry =
            entries.find(
                item =>
                    item.id
                    ===
                    Number(
                        editingEntryId
                    )
            );


        if (!entry) {
            return;
        }


        setFormLoading(
            true
        );


        const success =
            await deleteEntryFromDatabase(
                entry
            );


        setFormLoading(
            false
        );


        if (success) {
            entryDialog.close();

            resetEntryForm();

            showToast(
                "Item deleted."
            );
        }
    }
);


// =========================
// INFO
// =========================

function openInfoDialog(entry) {
    infoName.textContent =
        entry.name;

    infoCreated.textContent =
        formatDateTime(
            entry.createdAt
        );

    infoUpdated.textContent =
        formatDateTime(
            entry.updatedAt
        );

    infoTerm.textContent =
        getTermLabel(
            entry.term
        );

    infoColor.textContent =
        entry.color.toUpperCase();

    infoColorDot.style.background =
        entry.color;


    infoDialog.showModal();
}


closeInfoButton.addEventListener(
    "click",
    () =>
        infoDialog.close()
);


infoDialog.addEventListener(
    "click",
    event => {
        if (
            event.target === infoDialog
        ) {
            infoDialog.close();
        }
    }
);


// =========================
// START APP
// =========================

async function startApp() {
    showGreeting();

    showCurrentDate();

    randomizeSectionLabels();


    const loaded =
        await loadEntries();


    if (loaded) {
        subscribeToChanges();
    }


    hideLoadingScreen();
}


startApp();